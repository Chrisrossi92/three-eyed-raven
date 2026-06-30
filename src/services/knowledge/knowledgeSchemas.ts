import { z } from "zod";

const domainBaseSchema = <TName extends string>(domainName: TName) =>
  z.object({
    domain: z.literal(domainName),
    version: z.number().int().positive(),
    description: z.string().min(1)
  });

export const realmCanonDomainSchema = domainBaseSchema("realm-canon").extend({
  records: z.array(
    z.object({
      id: z.string().min(1),
      category: z.enum([
        "server-premise",
        "role",
        "rule",
        "guide_faq",
        "house",
        "boss-progression",
        "rebellion-mechanic",
        "protected-area",
        "roleplay-expectation"
      ]),
      title: z.string().min(1),
      summary: z.string().min(1),
      aliases: z.array(z.string()).optional(),
      answer: z.string().min(1).optional(),
      relatedCommands: z.array(z.string()).optional(),
      domainReferences: z.array(z.string()).optional(),
      status: z.enum(["draft", "active", "retired", "needs_decision"]),
      tags: z.array(z.string())
    })
  )
});

export const chronicleDomainSchema = domainBaseSchema("chronicle").extend({
  events: z.array(
    z.object({
      id: z.string().min(1),
      category: z.enum([
        "boss-kill",
        "alliance",
        "betrayal",
        "battle",
        "throne-change",
        "ruling",
        "ceremony",
        "major-build",
        "server-wide-event"
      ]),
      title: z.string().min(1),
      summary: z.string().min(1),
      occurredAt: z.string().datetime().nullable(),
      status: z.enum(["placeholder", "claimed", "validated", "corrected"]),
      actors: z.array(z.string()),
      houses: z.array(z.string()),
      sources: z.array(z.string()),
      tags: z.array(z.string())
    })
  )
});

const realmOfficerSchema = z.object({
  name: z.string().min(1),
  since: z.string().datetime().nullable(),
  source: z.string().min(1)
});

const realmRelationshipSchema = z.object({
  houses: z.array(z.string()),
  since: z.string().datetime().nullable(),
  source: z.string().min(1)
});

export const realmStateDomainSchema = domainBaseSchema("realm-state").extend({
  currentKing: realmOfficerSchema,
  handOfTheKing: realmOfficerSchema.nullable(),
  kingsguard: z.array(realmOfficerSchema),
  knownRoles: z.array(
    z.object({
      role: z.string().min(1),
      holder: z.string().min(1),
      houseId: z.string().nullable(),
      status: z.enum(["confirmed", "draft", "considering"]),
      source: z.string().min(1)
    })
  ),
  activeHouses: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      leader: z.string().nullable(),
      members: z.array(z.string()),
      status: z.enum(["forming", "active", "inactive", "fallen"])
    })
  ),
  currentAlliances: z.array(realmRelationshipSchema),
  currentWars: z.array(realmRelationshipSchema),
  activeBossGate: z.object({
    boss: z.string().min(1),
    status: z.enum(["not-started", "active", "defeated", "locked"]),
    updatedAt: z.string().datetime().nullable()
  }),
  season: z.object({
    name: z.string().min(1),
    status: z.enum(["setup", "active", "paused", "complete"]),
    startedAt: z.string().datetime().nullable()
  }),
  pendingDecisions: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      summary: z.string().min(1),
      tags: z.array(z.string())
    })
  )
});

export const ravenMindDomainSchema = domainBaseSchema("raven-mind").extend({
  modes: z.array(
    z.object({
      name: z.enum(["plain-guide", "lore", "snark"]),
      purpose: z.string().min(1),
      maxSentences: z.number().int().positive()
    })
  ),
  silenceRules: z.array(z.string()),
  keywordTriggers: z.array(
    z.object({
      phrase: z.string().min(1),
      mode: z.enum(["plain-guide", "lore", "snark"]),
      responseHint: z.string().min(1),
      enabled: z.boolean()
    })
  ),
  responseBoundaries: z.object({
    defaultVisibility: z.enum(["public", "private"]),
    preferPrivateFor: z.array(z.string()),
    neverInventFacts: z.boolean(),
    fallbackMessage: z.string().min(1),
    privateAdminGuidance: z.string().min(1)
  })
});

export const worldIntelligenceDomainSchema = domainBaseSchema("world-intelligence").extend({
  serverStatus: z.object({
    state: z.enum(["unknown", "online", "offline", "restarting"]),
    uptimeSeconds: z.number().int().nonnegative().nullable(),
    updatedAt: z.string().datetime().nullable()
  }),
  onlinePlayers: z.array(
    z.object({
      playerName: z.string().min(1),
      houseId: z.string().nullable(),
      joinedAt: z.string().datetime().nullable(),
      lastSeenAt: z.string().datetime().nullable()
    })
  ),
  recentEvents: z.array(
    z.object({
      id: z.string().min(1),
      type: z.string().min(1),
      observedAt: z.string().datetime(),
      source: z.enum(["gameops", "manual", "discord"]),
      payload: z.record(z.unknown())
    })
  ),
  gameOpsBridge: z.object({
    enabled: z.boolean(),
    lastSuccessfulSyncAt: z.string().datetime().nullable(),
    lastEventId: z.string().nullable()
  })
});
