  @SubscribeMessage("mute-unmute")
  async mute_UnmuteParticipant(
    @ConnectedSocket() socket: Socket,
    @Body("mute/unmute-target") target: target
  ) {
    try {
      const channel = await this.validateChannel(target.channelId);
      const executorParticipant = await this.validateExecutorParticipant(socket, channel);
      const targetParticipant = await this.validateTargetParticipant(target);

      this.validatePrivileges(socket, target, executorParticipant, targetParticipant);

      this.toggleMuteStatus(target, targetParticipant);
    } catch (error) {
      this.server.to(socket.id).emit("arg-error", { error: error.toString() });
    }
  }

  async validateChannel(channelId: number) {
    const channel = await this.chatService.getChannelById(channelId);
    if (!channel) throw new Error(`the channel with the id ${channelId} doesnt exist`);
    return channel;
  }

  async validateExecutorParticipant(socket: Socket, channel: any) {
    const executorParticipant = await this.chatService.filterParticipantByIds(
      +socket.handshake.query.userId,
      channel.id
    );
    if (!executorParticipant || executorParticipant.role === Role.MEMBER)
      throw new Error(`the user with the id ${socket.handshake.query.userId} doesnt have privilege over the channel`);
    return executorParticipant;
  }

  async validateTargetParticipant(target: any) {
    const targetParticipant = await this.chatService.filterParticipantByIds(
      target.id,
      target.channelId
    );
    if (!targetParticipant)
      throw new Error(`the user with the id ${target.id} doesnt exist in the channel`);
    return targetParticipant;
  }

  validatePrivileges(socket: Socket, target: any, executorParticipant: any, targetParticipant: any) {
    if (Number(socket.handshake.query.userId) === target.id)
      throw new Error("cannot mute self");
    if (targetParticipant.role !== Role.MEMBER) {
      if (executorParticipant.role !== Role.ADMIN)
        throw new Error("cannot mute//unmute a mod or a channel admin");
    } else {
      throw new Error("you do not have the privilege to mute/unmute users");
    }
  }

  toggleMuteStatus(target: any, targetParticipant: any) {
    if (target.muteUnmute && !targetParticipant.mute)
      targetParticipant.mute = true;
    else if (!target.muteUnmute && targetParticipant.mute)
      targetParticipant.mute = false;
  }