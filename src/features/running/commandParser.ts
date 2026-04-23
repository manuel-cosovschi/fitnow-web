import type { AICommand, AICommandAdapter, CommandIntent, RouteConstraints } from './types';

/**
 * Rule-based parser for Spanish running commands.
 * Covers the 9 use cases in the spec. Returns `unknown` with confidence 0
 * when no rule matches, so the upstream caller can fall back to the LLM adapter.
 */
const RULES: Array<{
  intent: CommandIntent;
  patterns: RegExp[];
  build: (m: RegExpMatchArray | null, raw: string) => RouteConstraints;
}> = [
  {
    intent: 'extend_distance',
    patterns: [
      /(?:haceme|sum[aá]|agreg[aá]|m[aá]s)\s+(\d+(?:[.,]\d+)?)\s*(km|kil[oó]metros?|m|metros?)/i,
      /(\d+(?:[.,]\d+)?)\s*(km|kil[oó]metros?|m|metros?)\s+(?:m[aá]s|extra|adicionales)/i,
    ],
    build: (m) => {
      if (!m) return { deltaDistanceMeters: 1000 };
      const qty = parseFloat(m[1].replace(',', '.'));
      const unit = m[2]?.toLowerCase() ?? 'km';
      const meters = unit.startsWith('k') ? qty * 1000 : qty;
      return { deltaDistanceMeters: Math.round(meters) };
    },
  },
  {
    intent: 'shorten_distance',
    patterns: [
      /(?:acort[aá]|rest[aá]|quit[aá]|menos)\s+(\d+(?:[.,]\d+)?)\s*(km|kil[oó]metros?|m|metros?)/i,
      /(\d+(?:[.,]\d+)?)\s*(km|kil[oó]metros?|m|metros?)\s+menos/i,
    ],
    build: (m) => {
      if (!m) return { deltaDistanceMeters: -500 };
      const qty = parseFloat(m[1].replace(',', '.'));
      const unit = m[2]?.toLowerCase() ?? 'm';
      const meters = unit.startsWith('k') ? qty * 1000 : qty;
      return { deltaDistanceMeters: -Math.round(meters) };
    },
  },
  {
    intent: 'avoid_hills',
    patterns: [/evit[aá]\w*\s+(?:las?\s+)?subidas?/i, /sin\s+subidas/i, /plan[oa]/i, /terreno\s+llano/i],
    build: () => ({ avoidHills: true }),
  },
  {
    intent: 'add_hills',
    patterns: [/m[aá]s\s+dif[ií]cil/i, /dame\s+subidas?/i, /agreg[aá]\s+desnivel/i, /m[aá]s\s+desnivel/i],
    build: () => ({ preferHills: true }),
  },
  {
    intent: 'return_home',
    patterns: [
      /volv[eé]r?\s+a\s+casa/i,
      /(?:llev[aá]me|llevame)\s+a\s+casa/i,
      /(?:regres[aá]|volv[eé])\s+al?\s+inicio/i,
      /terminar\s+ya/i,
    ],
    build: () => ({ returnToStart: true }),
  },
  {
    intent: 'add_sprint',
    patterns: [/sprint\s+(?:de\s+)?(\d+)\s*(m|metros?|km)/i, /agreg[aá]\s+sprint/i],
    build: (m) => {
      const qty = m ? parseInt(m[1], 10) : 500;
      const unit = m?.[2]?.toLowerCase() ?? 'm';
      return { sprintMeters: unit.startsWith('k') ? qty * 1000 : qty };
    },
  },
  {
    intent: 'prefer_shade',
    patterns: [/m[aá]s\s+sombra/i, /con\s+sombra/i, /ruta\s+sombreada/i],
    build: () => ({ preferShade: true }),
  },
  {
    intent: 'avoid_traffic',
    patterns: [/menos\s+tr[aá]nsito/i, /evit[aá]\w*\s+(?:avenidas?|tr[aá]fico)/i, /sin\s+autos?/i],
    build: () => ({ avoidTraffic: true }),
  },
  {
    intent: 'safer_route',
    patterns: [/ruta\s+m[aá]s\s+segura/i, /m[aá]s\s+segur[oa]/i, /seguridad/i],
    build: () => ({ maximizeSafety: true }),
  },
  {
    intent: 'finish_by',
    patterns: [
      /terminar\s+en\s+(\d+)\s*(?:min|minutos?)/i,
      /quiero\s+(?:correr|terminar)\s+(\d+)\s*(?:min|minutos?)/i,
    ],
    build: (m) => ({ targetDurationSeconds: m ? parseInt(m[1], 10) * 60 : 1800 }),
  },
  {
    intent: 'route_via',
    patterns: [/pas[aá]\s+por\s+(?:la|el|los|las)?\s*(.+)$/i, /llevame\s+(?:por|hacia)\s+(.+)$/i],
    build: (m) => ({ viaPlace: m?.[1]?.trim().replace(/[.,!?]$/, '') || '' }),
  },
];

export function parseCommandRuleBased(raw: string): { intent: CommandIntent; constraints: RouteConstraints; confidence: number } {
  const text = raw.trim();
  if (!text) return { intent: 'unknown', constraints: {}, confidence: 0 };

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const m = text.match(pattern);
      if (m) return { intent: rule.intent, constraints: rule.build(m, text), confidence: 0.85 };
    }
  }
  return { intent: 'unknown', constraints: {}, confidence: 0 };
}

/**
 * Builds an AICommand object ready to persist. If the rule-based parser fails
 * and an LLM adapter is provided, falls back to it. When the adapter is not
 * wired (current default) the command is still recorded with intent=unknown
 * so downstream UX can show "no entendí el comando".
 */
export async function buildCommand(
  raw: string,
  source: AICommand['source'],
  adapter?: AICommandAdapter,
): Promise<AICommand> {
  const ruleResult = parseCommandRuleBased(raw);
  let { intent, constraints, confidence } = ruleResult;

  if (intent === 'unknown' && adapter) {
    try {
      const ai = await adapter.parse(raw);
      intent = ai.intent;
      constraints = ai.constraints;
      confidence = ai.confidence;
    } catch {
      /* keep unknown */
    }
  }

  return {
    id: `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    rawText: raw,
    intent,
    constraints,
    confidence,
    applied: false,
    appliedAt: null,
    timestamp: Date.now(),
    source,
  };
}

/** Human-readable label for each intent, used in UI toast/feedback. */
export const INTENT_LABELS: Record<CommandIntent, string> = {
  extend_distance:  'Extender distancia',
  shorten_distance: 'Acortar ruta',
  avoid_hills:      'Evitar subidas',
  add_hills:        'Más difícil',
  return_home:      'Volver al inicio',
  route_via:        'Pasar por un lugar',
  add_sprint:       'Agregar sprint',
  prefer_shade:     'Buscar sombra',
  avoid_traffic:    'Evitar tránsito',
  safer_route:      'Ruta más segura',
  finish_by:        'Ajustar tiempo objetivo',
  unknown:          'No entendí el comando',
};
