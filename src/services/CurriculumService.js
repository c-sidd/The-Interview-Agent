const fs = require('fs');
const path = require('path');

class CurriculumService {
  constructor() {
    this.candidatesPath = path.resolve(__dirname, '../../candidates.json');
    this.curriculumPath = path.resolve(__dirname, '../../curriculum.json');
    this.loadData();
  }

  loadData() {
    try {
      const candidatesRaw = fs.readFileSync(this.candidatesPath, 'utf8');
      this.candidatesData = JSON.parse(candidatesRaw).candidates;
    } catch (err) {
      console.error(`Error loading candidates.json: ${err.message}`);
      this.candidatesData = [];
    }

    try {
      const curriculumRaw = fs.readFileSync(this.curriculumPath, 'utf8');
      this.curriculumData = JSON.parse(curriculumRaw);
    } catch (err) {
      console.error(`Error loading curriculum.json: ${err.message}`);
      this.curriculumData = { cohort: '', modules: [], days: [] };
    }
  }

  getCandidates() {
    return this.candidatesData;
  }

  getCandidateById(candidateId) {
    return this.candidatesData.find(c => c.member.id === candidateId) || null;
  }

  getCurriculum() {
    return this.curriculumData;
  }

  getDayDetails(dayNumber) {
    if (!this.curriculumData || !this.curriculumData.days) return null;
    return this.curriculumData.days.find(d => d.day === parseInt(dayNumber)) || null;
  }

  /**
   * Programmatically selects 4 unique curriculum days for the candidate:
   * 1. A day they passed on the first try (strength).
   * 2. A day they struggled with (high attempts or passed = false).
   * 3. A day they skipped.
   * 4. A core/capstone day.
   */
  selectTargetDays(candidate) {
    if (!candidate || !candidate.missions) {
      return [7, 8, 10, 11, 13, 22, 28, 31]; // Default fallback core 8 days
    }

    const selectedDaysSet = new Set();
    const missions = candidate.missions;

    // 1. Select up to 2 skipped days
    const skippedMissions = missions.filter(m => m.skipped === true);
    if (skippedMissions.length > 0) {
      // Shuffle skipped
      const shuffled = skippedMissions.sort(() => 0.5 - Math.random());
      shuffled.slice(0, 2).forEach(m => selectedDaysSet.add(m.day));
    }

    // 2. Select up to 2 struggled days (attempts > 1 OR passed === false)
    const struggledMissions = missions.filter(m => 
      m.skipped !== true && (m.attempts > 1 || m.passed === false)
    );
    if (struggledMissions.length > 0) {
      const eligible = struggledMissions.filter(m => !selectedDaysSet.has(m.day));
      const shuffled = eligible.sort(() => 0.5 - Math.random());
      shuffled.slice(0, 2).forEach(m => selectedDaysSet.add(m.day));
    }

    // 3. Select up to 2 strength days (passed === true and attempts === 1)
    const strengthMissions = missions.filter(m => 
      m.passed === true && m.attempts === 1
    );
    if (strengthMissions.length > 0) {
      const eligible = strengthMissions.filter(m => !selectedDaysSet.has(m.day));
      const shuffled = eligible.sort(() => 0.5 - Math.random());
      shuffled.slice(0, 2).forEach(m => selectedDaysSet.add(m.day));
    }

    // 4. Select core/capstone days to fill up (Day 7, 8, 10, 11, 13, 21, 22, 23, 27, 28, 31)
    const coreDays = [7, 8, 10, 11, 13, 21, 22, 23, 27, 28, 31];
    const eligibleCore = coreDays.filter(day => !selectedDaysSet.has(day));
    const shuffledCore = eligibleCore.sort(() => 0.5 - Math.random());
    let coreIndex = 0;
    while (selectedDaysSet.size < 8 && coreIndex < shuffledCore.length) {
      selectedDaysSet.add(shuffledCore[coreIndex]);
      coreIndex++;
    }

    // Fallback: If we don't have 8 unique days, fill from the candidate's completed days
    const allMissionsDays = missions.map(m => m.day);
    let index = 0;
    while (selectedDaysSet.size < 8 && index < allMissionsDays.length) {
      selectedDaysSet.add(allMissionsDays[index]);
      index++;
    }

    // If still less than 8, fill with generic core days
    const genericBackups = [7, 8, 10, 11, 12, 13, 16, 21, 22, 23, 27, 28, 31];
    let backupIndex = 0;
    while (selectedDaysSet.size < 8 && backupIndex < genericBackups.length) {
      selectedDaysSet.add(genericBackups[backupIndex]);
      backupIndex++;
    }

    return Array.from(selectedDaysSet).slice(0, 8);
  }
}

module.exports = CurriculumService;
