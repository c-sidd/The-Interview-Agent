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
      return [7, 10, 22, 28]; // Default fallback core days
    }

    const selectedDaysSet = new Set();
    const missions = candidate.missions;

    // 1. Select a skipped day
    const skippedMissions = missions.filter(m => m.skipped === true);
    if (skippedMissions.length > 0) {
      const randomSkipped = skippedMissions[Math.floor(Math.random() * skippedMissions.length)];
      selectedDaysSet.add(randomSkipped.day);
    }

    // 2. Select a struggled day (attempts > 1 OR passed === false)
    const struggledMissions = missions.filter(m => 
      m.skipped !== true && (m.attempts > 1 || m.passed === false)
    );
    if (struggledMissions.length > 0) {
      // Find one that doesn't duplicate
      const eligible = struggledMissions.filter(m => !selectedDaysSet.has(m.day));
      if (eligible.length > 0) {
        const randomStruggled = eligible[Math.floor(Math.random() * eligible.length)];
        selectedDaysSet.add(randomStruggled.day);
      }
    }

    // 3. Select a strength day (passed === true and attempts === 1)
    const strengthMissions = missions.filter(m => 
      m.passed === true && m.attempts === 1
    );
    if (strengthMissions.length > 0) {
      const eligible = strengthMissions.filter(m => !selectedDaysSet.has(m.day));
      if (eligible.length > 0) {
        const randomStrength = eligible[Math.floor(Math.random() * eligible.length)];
        selectedDaysSet.add(randomStrength.day);
      }
    }

    // 4. Select a core/capstone day (Day 7, 8, 10, 11, 13, 21, 22, 23, 27, 28, 31)
    const coreDays = [7, 8, 10, 11, 13, 21, 22, 23, 27, 28, 31];
    const eligibleCore = coreDays.filter(day => !selectedDaysSet.has(day));
    if (eligibleCore.length > 0) {
      const randomCore = eligibleCore[Math.floor(Math.random() * eligibleCore.length)];
      selectedDaysSet.add(randomCore);
    }

    // Fallback: If we don't have 4 unique days, fill from the candidate's completed days
    const allMissionsDays = missions.map(m => m.day);
    let index = 0;
    while (selectedDaysSet.size < 4 && index < allMissionsDays.length) {
      selectedDaysSet.add(allMissionsDays[index]);
      index++;
    }

    // If still less than 4 (e.g. empty candidate profile), fill with generic core days
    const genericBackups = [7, 8, 10, 12, 16, 22, 23, 28, 31];
    let backupIndex = 0;
    while (selectedDaysSet.size < 4 && backupIndex < genericBackups.length) {
      selectedDaysSet.add(genericBackups[backupIndex]);
      backupIndex++;
    }

    return Array.from(selectedDaysSet).slice(0, 4);
  }
}

module.exports = CurriculumService;
