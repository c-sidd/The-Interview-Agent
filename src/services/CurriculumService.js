const fs = require('fs');
const path = require('path');

class CurriculumService {
  constructor() {
    this.candidatesPath = path.resolve(__dirname, '../../candidates.json');
    this.curriculumPath = path.resolve(__dirname, '../../curriculum.json');
    this.loadData();
  }

  loadData() {
    this.candidatesLoadError = null;
    this.curriculumLoadError = null;

    try {
      if (!fs.existsSync(this.candidatesPath)) {
        throw new Error('candidates.json file is missing from path ' + this.candidatesPath);
      }
      const candidatesRaw = fs.readFileSync(this.candidatesPath, 'utf8');
      if (!candidatesRaw.trim()) {
        throw new Error('candidates.json file is empty');
      }
      const parsed = JSON.parse(candidatesRaw);
      if (!parsed || !Array.isArray(parsed.candidates)) {
        throw new Error('candidates.json is missing required "candidates" array');
      }
      this.candidatesData = parsed.candidates;
    } catch (err) {
      this.candidatesLoadError = `Failed to load candidates data: ${err.message}`;
      this.candidatesData = [];
      console.error(this.candidatesLoadError);
    }

    try {
      if (!fs.existsSync(this.curriculumPath)) {
        throw new Error('curriculum.json file is missing from path ' + this.curriculumPath);
      }
      const curriculumRaw = fs.readFileSync(this.curriculumPath, 'utf8');
      if (!curriculumRaw.trim()) {
        throw new Error('curriculum.json file is empty');
      }
      const parsed = JSON.parse(curriculumRaw);
      if (!parsed || !Array.isArray(parsed.days)) {
        throw new Error('curriculum.json is missing required "days" array');
      }
      this.curriculumData = parsed;
    } catch (err) {
      this.curriculumLoadError = `Failed to load curriculum data: ${err.message}`;
      this.curriculumData = { cohort: '', modules: [], days: [] };
      console.error(this.curriculumLoadError);
    }
  }

  getCandidates() {
    this.loadData(); // reload dynamically on request
    if (this.candidatesLoadError) {
      throw new Error(this.candidatesLoadError);
    }
    return this.candidatesData;
  }

  getCandidateById(candidateId) {
    this.loadData(); // reload dynamically on request
    if (this.candidatesLoadError) {
      throw new Error(this.candidatesLoadError);
    }
    return this.candidatesData.find(c => c.member.id === candidateId) || null;
  }

  getCurriculum() {
    this.loadData(); // reload dynamically on request
    if (this.curriculumLoadError) {
      throw new Error(this.curriculumLoadError);
    }
    return this.curriculumData;
  }

  getDayDetails(dayNumber) {
    this.loadData(); // reload dynamically on request
    if (this.curriculumLoadError) {
      throw new Error(this.curriculumLoadError);
    }
    if (!this.curriculumData || !this.curriculumData.days) return null;
    return this.curriculumData.days.find(d => d.day === parseInt(dayNumber)) || null;
  }

  /**
   * Programmatically selects 8 unique curriculum days for the candidate:
   * 1. Skipped days (up to 2).
   * 2. Struggled days (up to 2).
   * 3. Strength days (up to 2).
   * 4. Dynamic core days to fill up.
   */
  selectTargetDays(candidate) {
    this.loadData(); // reload dynamically on request
    if (this.curriculumLoadError) {
      throw new Error(this.curriculumLoadError);
    }

    // Dynamically retrieve all available, valid day numbers from curriculum.json
    const allAvailableDays = (this.curriculumData.days || []).map(d => d.day);
    
    if (allAvailableDays.length === 0) {
      throw new Error('Curriculum has no day objectives defined');
    }

    const jobRole = (candidate.member && candidate.member.jobRole) ? candidate.member.jobRole : '';
    const isNonTechnical = /business|marketing|analyst/i.test(jobRole);

    // Dynamic checks if a day is an infrastructure day
    const isInfrastructureDay = (dayNum) => {
      const details = this.getDayDetails(dayNum);
      if (!details) return false;
      const tools = details.tools || [];
      const objectives = details.objectives || [];
      const regex = /docker|kubernetes|k8s|deployment|infrastructure|ci\/cd|terraform/i;
      const titleMatch = regex.test(details.title || '');
      const toolsMatch = tools.some(t => regex.test(t));
      const objectivesMatch = objectives.some(obj => regex.test(obj));
      return titleMatch || toolsMatch || objectivesMatch;
    };

    // Filter valid days (must exist in curriculum.json)
    const validDays = allAvailableDays.filter(dayNum => this.getDayDetails(dayNum) !== null);

    // Apply role-based filtering dynamically
    const eligibleDays = validDays.filter(dayNum => !isNonTechnical || !isInfrastructureDay(dayNum));

    if (eligibleDays.length === 0) {
      throw new Error('No eligible curriculum days found for this candidate profile');
    }

    const selectedDaysSet = new Set();
    const candidateMissions = candidate.missions || [];

    // Filter candidate missions to only include eligible days
    const missions = candidateMissions.filter(m => eligibleDays.includes(m.day));

    // 1. Select up to 2 skipped days
    const skippedMissions = missions.filter(m => m.skipped === true);
    if (skippedMissions.length > 0) {
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

    // 4. Fill up selection up to 8 unique days using eligibleDays from curriculum
    const eligibleCore = eligibleDays.filter(day => !selectedDaysSet.has(day));
    const shuffledCore = eligibleCore.sort(() => 0.5 - Math.random());
    let coreIndex = 0;
    while (selectedDaysSet.size < 8 && coreIndex < shuffledCore.length) {
      selectedDaysSet.add(shuffledCore[coreIndex]);
      coreIndex++;
    }

    // If still less than 8, fallback to fill with any validDays (even if they are infrastructure days)
    if (selectedDaysSet.size < 8) {
      const remainingValid = validDays.filter(day => !selectedDaysSet.has(day));
      const shuffledRemaining = remainingValid.sort(() => 0.5 - Math.random());
      let remIndex = 0;
      while (selectedDaysSet.size < 8 && remIndex < shuffledRemaining.length) {
        selectedDaysSet.add(shuffledRemaining[remIndex]);
        remIndex++;
      }
    }

    // Ensure we return an array of up to 8 unique days
    return Array.from(selectedDaysSet).slice(0, 8);
  }
}

module.exports = CurriculumService;
