export type DiscordPermissionConfig = {
  adminUserIds: string[];
  adminRoleIds: string[];
  smallCouncilChannelId?: string;
};

export type AdminRavenInteractionContext = {
  userId: string;
  memberRoleIds: string[];
  channelId?: string | null;
};

export class DiscordPermissionService {
  private readonly adminUserIds: Set<string>;
  private readonly adminRoleIds: Set<string>;
  private readonly smallCouncilChannelId?: string;

  constructor(config: DiscordPermissionConfig) {
    this.adminUserIds = new Set(config.adminUserIds);
    this.adminRoleIds = new Set(config.adminRoleIds);

    if (config.smallCouncilChannelId) {
      this.smallCouncilChannelId = config.smallCouncilChannelId;
    }
  }

  isAdminUser(userId: string): boolean {
    return this.adminUserIds.has(userId);
  }

  hasAdminRole(memberRoleIds: readonly string[]): boolean {
    return memberRoleIds.some((roleId) => this.adminRoleIds.has(roleId));
  }

  canUseAdminRaven(context: AdminRavenInteractionContext): boolean {
    return this.isAdminUser(context.userId) || this.hasAdminRole(context.memberRoleIds);
  }

  hasSmallCouncilChannel(): boolean {
    return Boolean(this.smallCouncilChannelId);
  }

  isSmallCouncilChannel(channelId?: string | null): boolean {
    if (!this.smallCouncilChannelId || !channelId) {
      return false;
    }

    return channelId === this.smallCouncilChannelId;
  }
}
