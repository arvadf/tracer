import { surveyRepository } from '../repositories/survey.repository';
import { pool } from '../db/pool';
import { logger } from '../utils/logger';
import { randomUUID } from 'crypto';

/**
 * Dashboard service - chart data aggregation.
 * Returns all chart data needed by PRD 3.2.4.
 */
export const dashboardService = {
  /**
   * Get all dashboard chart data in a single call.
   */
  async getCharts() {
    const requestId = randomUUID().split('-')[0]; 

    const thresholds: Record<string, number> = {
      universitasPpg: 150,
      jurusanS2s3: 150,
      universitasS2s3: 150,
      totalAlumni: 50,
      totalSurveys: 50,
    };

    // Helper to monitor latency per query and alert if bottleneck is detected
    const timed = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
      const qStart = performance.now();
      const result = await fn();
      const duration = Math.round(performance.now() - qStart);
      const threshold = thresholds[name] ?? 200;
      
      if (duration > threshold) {
        logger.warn(`[${requestId}] [DashboardService Slow Query] ${name} took ${duration}ms (threshold: ${threshold}ms)`);
      } else {
        logger.info(`[${requestId}] [Query] ${name} took ${duration}ms`);
      }
      return result;
    };

    const start = performance.now();

    const [
      statusPekerjaan,
      universitasPpg,
      universitasS2s3,
      jurusanS2s3,
      ppgDistribution,
      s2s3Distribution,
      tahunLulus,
      totalSurveys,
      totalAlumniResult,
    ] = await Promise.all([
      timed('statusPekerjaan', () => surveyRepository.countByStatusPekerjaan()),
      timed('universitasPpg', () => surveyRepository.countByUniversitasPpg()),
      timed('universitasS2s3', () => surveyRepository.countByUniversitasS2s3()),
      timed('jurusanS2s3', () => surveyRepository.countByJurusanS2s3()),
      timed('ppgDistribution', () => surveyRepository.countPpgDistribution()),
      timed('s2s3Distribution', () => surveyRepository.countS2s3Distribution()),
      timed('tahunLulus', () => surveyRepository.countByTahunLulus()),
      timed('totalSurveys', () => surveyRepository.countTotal()),
      timed('totalAlumni', () => pool.query(`SELECT COUNT(*)::int AS total FROM alumni`)),
    ]);

    const latencyMs = Math.round(performance.now() - start);
    logger.info(`[${requestId}] [DashboardService] Fetched 9 chart queries in ${latencyMs}ms concurrently`);

    const totalAlumni = totalAlumniResult.rows[0].total as number;

    return {
      summary: {
        total_alumni: totalAlumni,
        total_surveys: totalSurveys,
        belum_mengisi: totalAlumni - totalSurveys,
        response_rate: totalAlumni > 0 ? Math.round((totalSurveys / totalAlumni) * 100 * 100) / 100 : 0,
      },
      status_pekerjaan: statusPekerjaan,
      universitas_ppg: universitasPpg,
      universitas_s2s3: universitasS2s3,
      jurusan_s2s3: jurusanS2s3,
      ppg_distribution: ppgDistribution,
      s2s3_distribution: s2s3Distribution,
      tahun_lulus: tahunLulus,
    };
  },
};
