import { Controller, Get, Param } from "@nestjs/common";
import { MatchService } from "./match.service";

@Controller('match')
export class MatchController {
    constructor (private matchService: MatchService) {}

    @Get("/history/:id")
    async getMatchHistoryByUserId(
        @Param("id") userId: number
    ) {
        userId = Number(userId);
        return await this.matchService.getMatchHistoryByUserId(userId);
    }
}