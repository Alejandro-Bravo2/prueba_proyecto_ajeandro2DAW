package com.gestioneventos.cofira.scheduler;

import com.gestioneventos.cofira.services.AIGenerationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class WeeklyPlanScheduler {

    private static final Logger logger = LoggerFactory.getLogger(WeeklyPlanScheduler.class);

    @Autowired
    private AIGenerationService aiGenerationService;

    /**
     * Regenerates workout and meal plans for all users every Sunday at midnight.
     * Cron expression: second minute hour day-of-month month day-of-week
     * "0 0 0 * * SUN" = At 00:00:00 every Sunday
     */
    @Scheduled(cron = "0 0 0 * * SUN")
    public void regenerateWeeklyPlans() {
        logger.info("Starting weekly plan regeneration for all users...");

        try {
            aiGenerationService.regenerateAllUserPlans();
            logger.info("Weekly plan regeneration completed successfully");
        } catch (Exception e) {
            logger.error("Error during weekly plan regeneration: {}", e.getMessage(), e);
        }
    }
}
