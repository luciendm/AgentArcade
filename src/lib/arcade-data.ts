/**
 * ERScapades in-memory data + hooks.
 * All data is ephemeral (resets on refresh) per Agents.md guidance.
 */
import { useSyncExternalStore, useCallback, useState, useEffect } from "react";
import { memory } from "@/lib/memory-store";

export type Category = "empathy" | "deesc" | "product" | "compliance" | "listening";

export type GameType = "quiz" | "scramble" | "tone" | "speed" | "escalation" | "crossword";

export interface GameTypeInfo {
  id: GameType;
  label: string;
  emoji: string;
  short: string;
}

export const GAME_TYPES: GameTypeInfo[] = [
  { id: "quiz", label: "Scenario Quiz", emoji: "\u{1F9E0}", short: "Quiz" },
  { id: "scramble", label: "Word Scramble", emoji: "\u{1F524}", short: "Scramble" },
  { id: "tone", label: "Tone Detector", emoji: "\u{1F3A7}", short: "Tone" },
  { id: "speed", label: "Speed Round", emoji: "\u{23F1}\u{FE0F}", short: "Speed" },
  { id: "escalation", label: "Escalation Meter", emoji: "\u{1F6A8}", short: "Escalation" },
  { id: "crossword", label: "Terminology Crossword", emoji: "\u{1F4DA}", short: "Crossword" },
];

export function getGameType(id: GameType): GameTypeInfo {
  return GAME_TYPES.find(g => g.id === id) ?? GAME_TYPES[0];
}

export interface CategoryInfo {
  id: Category;
  label: string;
  gradient: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: "empathy", label: "Empathy", gradient: "gradient-empathy", emoji: "\u{1F497}", color: "oklch(0.62 0.22 20)" },
  { id: "deesc", label: "De-escalation", gradient: "gradient-deesc", emoji: "\u{1F9EF}", color: "oklch(0.55 0.24 27)" },
  { id: "product", label: "ERS Know-How", gradient: "gradient-product", emoji: "\u{1F5FA}\u{FE0F}", color: "oklch(0.42 0.19 260)" },
  { id: "compliance", label: "Compliance", gradient: "gradient-compliance", emoji: "\u{1F6E1}\u{FE0F}", color: "oklch(0.4 0.18 275)" },
  { id: "listening", label: "Active Listening", gradient: "gradient-listening", emoji: "\u{1F442}", color: "oklch(0.6 0.16 195)" },
];

export function getCategory(id: Category): CategoryInfo {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0];
}

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// ---------- Payloads for each game type ----------
export interface QuizPayload {
  kind: "quiz";
  questions: Question[];
}
export interface ScrambleWord {
  id: string;
  word: string;         // the real answer, uppercase, no spaces
  hint: string;
}
export interface ScramblePayload {
  kind: "scramble";
  seconds: number;
  words: ScrambleWord[];
}
export interface ToneItem {
  id: string;
  line: string;
  correctTone: string;
  choices: string[];
  explanation: string;
}
export interface TonePayload {
  kind: "tone";
  items: ToneItem[];
}
export interface SpeedItem {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}
export interface SpeedPayload {
  kind: "speed";
  seconds: number;      // total round time
  items: SpeedItem[];
}
export interface EscalationTurn {
  id: string;
  memberLine: string;
  options: { text: string; delta: number; feedback: string }[]; // delta: +raises meter (bad), -lowers meter (good)
}
export interface EscalationPayload {
  kind: "escalation";
  startMeter: number;   // 0-100
  targetMax: number;    // fail threshold
  turns: EscalationTurn[];
}
export interface CrosswordClue {
  id: string;
  clue: string;
  answer: string;       // uppercase
}
export interface CrosswordPayload {
  kind: "crossword";
  clues: CrosswordClue[];
}

export type GamePayload =
  | QuizPayload
  | ScramblePayload
  | TonePayload
  | SpeedPayload
  | EscalationPayload
  | CrosswordPayload;

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: Category;
  gameType: GameType;
  difficulty: 1 | 2 | 3;
  durationMin: number;
  xpReward: number;
  featured?: boolean;
  locked?: boolean;
  questions: Question[]; // legacy: also present for quiz missions (mirrors payload)
  payload: GamePayload;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
}

export interface Agent {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  totalXp: number;
  level: number;
  streak: number;
  rank: number;
  team: string;
  jobTitle: string;
  manager: string;
  managerTitle: string;
  officeLocation: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  weekXp: number;
  monthXp: number;
  allTimeXp: number;
  level: number;
  streak: number;
  isCurrentUser?: boolean;
}

export interface ProgressRecord {
  missionId: string;
  completed: boolean;
  accuracy: number;
  xpEarned: number;
  completedAt: string;
}

export interface ActivityEntry {
  id: string;
  kind: "mission" | "badge" | "levelup";
  label: string;
  detail: string;
  emoji: string;
  when: string;
}

export function xpForLevel(level: number): number { return level * 500; }
export function levelProgress(totalXp: number) {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  const needed = xpForLevel(level);
  return { level, intoLevel: remaining, needed, pct: remaining / needed };
}

function quiz(questions: Question[]): QuizPayload { return { kind: "quiz", questions }; }

function seedMissions(): Mission[] {
  const m: Mission[] = [
    {
      id: "m1", title: "Meet Them Where They Are",
      description: "Practice recognizing member emotions on a roadside call and responding with warmth.",
      category: "empathy", gameType: "quiz", difficulty: 1, durationMin: 3, xpReward: 120, featured: true,
      questions: [
        { id: "q1", prompt: "A member says: 'I've been stranded on the 405 for 40 minutes and no one is helping me.' What's the best opener?",
          options: ["Please calm down so I can help you.", "I completely understand \u2014 40 minutes on the shoulder is a long time. I'm so sorry, and I'll stay with you until a truck is rolling.", "Our dispatch has been slammed today.", "Can you hold one more minute?"],
          correctIndex: 1, explanation: "Acknowledge the feeling first, then commit to a concrete next step." },
        { id: "q2", prompt: "Which phrase best validates a frustrated member?",
          options: ["That's actually a really common issue.", "I hear you \u2014 stuck on the side of the road would frustrate anyone.", "Let me transfer you.", "You should have called sooner."],
          correctIndex: 1, explanation: "Naming and normalizing the feeling builds trust fast." },
        { id: "q3", prompt: "Empathy is best expressed through\u2026",
          options: ["Scripted apologies", "Tone, pacing, and specific acknowledgement of the member's situation", "Fast talking", "Silence"],
          correctIndex: 1, explanation: "Specific acknowledgment shows the member you actually listened." },
      ],
      payload: null as unknown as GamePayload,
    },
    {
      id: "m2", title: "Cool the Fire",
      description: "De-escalate a heated roadside call using proven techniques.",
      category: "deesc", gameType: "quiz", difficulty: 2, durationMin: 4, xpReward: 180,
      questions: [
        { id: "q1", prompt: "A member is yelling because a tow was rerouted. What should you do FIRST?",
          options: ["Match their energy so they know you're serious", "Lower your voice and slow your pace", "Put them on hold", "Warn them about the call being recorded"],
          correctIndex: 1, explanation: "Speaking slowly and softly invites the member to mirror you." },
        { id: "q2", prompt: "Which phrase is most likely to escalate a member?",
          options: ["'Let me see what I can do.'", "'That's our policy.'", "'Help me understand what happened.'", "'I'm going to get this fixed with you.'"],
          correctIndex: 1, explanation: "'Policy' feels dismissive. Explain the 'why' or offer a workaround." },
      ],
      payload: null as unknown as GamePayload,
    },
    {
      id: "m3", title: "ERS 101: Service Levels & Coverage",
      description: "Master the AAA Emergency Roadside Service tiers and what's included.",
      category: "product", gameType: "quiz", difficulty: 1, durationMin: 3, xpReward: 100,
      questions: [
        { id: "q1", prompt: "Which AAA membership tier includes 200-mile towing per disablement?",
          options: ["Classic", "Plus", "Premier", "None of the above"],
          correctIndex: 2, explanation: "Premier includes one 200-mile tow per household per year. Plus tops out at 100 miles." },
        { id: "q2", prompt: "What's the fastest way to upgrade a member mid-call?",
          options: ["Send them an email link", "Use the in-console 'Upgrade Membership' shortcut", "Transfer to sales", "Ask them to visit AAA.com"],
          correctIndex: 1, explanation: "The in-console shortcut prevents drop-off and captures the upgrade instantly." },
      ],
      payload: null as unknown as GamePayload,
    },
    {
      id: "m4", title: "Compliance Quick Check",
      description: "Review disclosure language and PII handling on recorded calls.",
      category: "compliance", gameType: "quiz", difficulty: 2, durationMin: 4, xpReward: 160,
      questions: [
        { id: "q1", prompt: "When must you provide the call-recording disclosure?",
          options: ["After identifying the member", "At the start of the call, before collecting information", "Only if the member asks", "At the end of the call"],
          correctIndex: 1, explanation: "Disclosure must precede any info collection." },
        { id: "q2", prompt: "Which is NOT considered PII?",
          options: ["Full name", "Membership tier", "Home address", "Date of birth"],
          correctIndex: 1, explanation: "Membership tier alone isn't personally identifying." },
      ],
      payload: null as unknown as GamePayload,
    },
    {
      id: "m5", title: "The Art of Listening",
      description: "Sharpen your ear for what the member is really telling you.",
      category: "listening", gameType: "quiz", difficulty: 1, durationMin: 3, xpReward: 110,
      questions: [
        { id: "q1", prompt: "Active listening is best demonstrated by\u2026",
          options: ["Repeating back your understanding in your own words", "Nodding silently", "Finishing their sentences", "Quickly proposing a tow"],
          correctIndex: 0, explanation: "Paraphrasing confirms you understood and invites correction." },
        { id: "q2", prompt: "What's the biggest listening pitfall on ERS calls?",
          options: ["Note-taking", "Formulating your reply while the member is still talking", "Asking clarifying questions", "Summarizing"],
          correctIndex: 1, explanation: "Planning your reply mid-sentence means you're not actually listening." },
      ],
      payload: null as unknown as GamePayload,
    },
    {
      id: "m6", title: "Empathy Under Pressure",
      description: "Advanced scenarios: empathy when the ETA clock is ticking.",
      category: "empathy", gameType: "quiz", difficulty: 3, durationMin: 5, xpReward: 220,
      questions: [
        { id: "q1", prompt: "When you can't get a truck out sooner, what matters most?",
          options: ["Setting a clear expectation and a next step", "Apologizing repeatedly", "Blaming dispatch", "Ending the call quickly"],
          correctIndex: 0, explanation: "Clarity + ownership beats repeated apologies every time." },
        { id: "q2", prompt: "A grieving member is calling to cancel a deceased spouse's membership. Best move?",
          options: ["Follow the standard retention script", "Pause the process, offer condolences, and simplify the steps", "Transfer immediately", "Ask for the account number first"],
          correctIndex: 1, explanation: "Human first, process second. Always." },
      ],
      payload: null as unknown as GamePayload,
    },
    {
      id: "m7", title: "Advanced De-escalation Drills",
      description: "For power users. Multi-turn hostility scenarios you'll actually see on ERS.",
      category: "deesc", gameType: "quiz", difficulty: 3, durationMin: 6, xpReward: 240, locked: true,
      questions: [
        { id: "q1", prompt: "A member threatens to post on social media that AAA left them stranded. Best response?",
          options: ["Warn them about defamation", "Acknowledge, offer a specific resolution timeline, and follow up in writing", "Ignore it", "Transfer to a supervisor immediately"],
          correctIndex: 1, explanation: "Specific ownership defuses the threat faster than any escalation." },
      ],
      payload: null as unknown as GamePayload,
    },
    {
      id: "m8", title: "ERS Deep Dive: Add-Ons & Extras",
      description: "Learn how to recommend the right coverage extras with confidence.",
      category: "product", gameType: "quiz", difficulty: 2, durationMin: 4, xpReward: 170,
      questions: [
        { id: "q1", prompt: "Which add-on pairs best with Premier for frequent road-trippers?",
          options: ["Rental car reimbursement", "Trip Interruption Coverage", "Home lockout add-on", "Battery replacement plan"],
          correctIndex: 1, explanation: "Trip Interruption Coverage protects members who travel far from home." },
      ],
      payload: null as unknown as GamePayload,
    },

    // -------- NEW GAME TYPES --------
    {
      id: "m9", title: "Jargon Jumble",
      description: "Unscramble ERS lingo before the clock runs out. Great daily warmup.",
      category: "product", gameType: "scramble", difficulty: 1, durationMin: 3, xpReward: 140, featured: true,
      questions: [],
      payload: {
        kind: "scramble",
        seconds: 90,
        words: [
          { id: "s1", word: "DISPATCH", hint: "Who we hand the call off to for the truck." },
          { id: "s2", word: "PREMIER", hint: "The membership tier with the 200-mile tow." },
          { id: "s3", word: "DISABLEMENT", hint: "Industry word for a stranded vehicle event." },
          { id: "s4", word: "LOCKOUT", hint: "Keys inside, member outside." },
          { id: "s5", word: "JUMPSTART", hint: "The fix when a battery just needs a boost." },
          { id: "s6", word: "ODOMETER", hint: "Reading we sometimes ask for on a tow." },
          { id: "s7", word: "EMPATHY", hint: "The superpower every ERS agent needs." },
        ],
      },
    },
    {
      id: "m10", title: "Read the Room",
      description: "Listen for tone, not just words. Identify what the member is really feeling.",
      category: "listening", gameType: "tone", difficulty: 2, durationMin: 4, xpReward: 160,
      questions: [],
      payload: {
        kind: "tone",
        items: [
          {
            id: "t1",
            line: "\"It's fine. I'll just wait. Like I always do.\"",
            correctTone: "Passive-aggressive",
            choices: ["Grateful", "Passive-aggressive", "Calm-and-clear", "Anxious"],
            explanation: "'Like I always do' is the tell \u2014 resigned frustration. Acknowledge the pattern, not just the wait.",
          },
          {
            id: "t2",
            line: "\"My baby is in the car and it's 95 degrees out here \u2014 how much longer?\"",
            correctTone: "Fearful / urgent",
            choices: ["Fearful / urgent", "Annoyed", "Confused", "Hostile"],
            explanation: "This is fear, not anger. Escalate to priority dispatch and stay on the line.",
          },
          {
            id: "t3",
            line: "\"So, uh, my car just kind of\u2026 stopped? I don't really know what happened.\"",
            correctTone: "Confused",
            choices: ["Angry", "Grieving", "Confused", "Sarcastic"],
            explanation: "Filler words and question-uptalk = uncertainty. Slow down, ask one thing at a time.",
          },
          {
            id: "t4",
            line: "\"YOU PEOPLE promised a truck an hour ago!\"",
            correctTone: "Hostile",
            choices: ["Grateful", "Fearful / urgent", "Hostile", "Neutral"],
            explanation: "'You people' + volume = openly hostile. Lower your voice and personalize the response.",
          },
          {
            id: "t5",
            line: "\"Thank you \u2014 seriously, thank you. I didn't know who else to call.\"",
            correctTone: "Grateful / relieved",
            choices: ["Grateful / relieved", "Sarcastic", "Confused", "Passive-aggressive"],
            explanation: "Match their warmth. This is a moment for a genuine 'that's exactly what we're here for.'",
          },
        ],
      },
    },
    {
      id: "m11", title: "Speed Run: ERS Rapid Fire",
      description: "20-second bursts of ERS trivia. Build a combo streak for bonus XP.",
      category: "product", gameType: "speed", difficulty: 2, durationMin: 2, xpReward: 200,
      questions: [],
      payload: {
        kind: "speed",
        seconds: 45,
        items: [
          { id: "sp1", prompt: "Classic tow limit?", options: ["5 mi", "7 mi", "25 mi", "100 mi"], correctIndex: 1 },
          { id: "sp2", prompt: "Plus tow limit?", options: ["25 mi", "50 mi", "100 mi", "200 mi"], correctIndex: 2 },
          { id: "sp3", prompt: "Premier tow limit?", options: ["100 mi", "150 mi", "200 mi", "Unlimited"], correctIndex: 2 },
          { id: "sp4", prompt: "Recording disclosure timing?", options: ["After ID", "Before info collection", "End of call", "Only if asked"], correctIndex: 1 },
          { id: "sp5", prompt: "Best empathy opener?", options: ["'Calm down'", "'I hear you'", "'It's policy'", "'Hold, please'"], correctIndex: 1 },
          { id: "sp6", prompt: "Which is PII?", options: ["Membership tier", "Zip code alone", "Full name + DOB", "Vehicle color"], correctIndex: 2 },
          { id: "sp7", prompt: "Lockout counts as a\u2026", options: ["Non-service", "Service call", "Sales lead", "Cancellation"], correctIndex: 1 },
          { id: "sp8", prompt: "Say instead of 'no'?", options: ["'That's policy'", "'Here's what I CAN do'", "'Not my job'", "'Try later'"], correctIndex: 1 },
          { id: "sp9", prompt: "First step in de-escalation?", options: ["Match energy", "Slow your pace", "Transfer", "Warn them"], correctIndex: 1 },
          { id: "sp10", prompt: "Best word choice?", options: ["Customer", "Member", "Caller", "User"], correctIndex: 1 },
        ],
      },
    },
    {
      id: "m12", title: "Keep It in the Green",
      description: "A live escalation meter climbs with every misstep. Talk them down turn by turn.",
      category: "deesc", gameType: "escalation", difficulty: 3, durationMin: 5, xpReward: 260, featured: true,
      questions: [],
      payload: {
        kind: "escalation",
        startMeter: 55,
        targetMax: 90,
        turns: [
          {
            id: "e1",
            memberLine: "\"I've been on hold FOREVER. Where is my truck?\"",
            options: [
              { text: "'Please calm down, ma'am.'", delta: 20, feedback: "'Calm down' almost always makes it worse. Never label their feeling as the problem." },
              { text: "'I completely hear you \u2014 that wait is way too long. Let me get eyes on your dispatch right now.'", delta: -18, feedback: "Named the feeling, took ownership, gave a next step. Textbook." },
              { text: "'Our systems are really slow today.'", delta: 10, feedback: "Excuses read as deflection to a frustrated member." },
            ],
          },
          {
            id: "e2",
            memberLine: "\"You said 30 minutes and it's been 55. Are you kidding me?\"",
            options: [
              { text: "'You're right \u2014 55 minutes is not what I promised. Here's what I'm doing right now\u2026'", delta: -20, feedback: "Owning the miss beats defending the process every time." },
              { text: "'Traffic's been really bad.'", delta: 12, feedback: "Even if true, blaming outside factors erodes trust." },
              { text: "'That's just an estimate.'", delta: 18, feedback: "Technically true, emotionally tone-deaf." },
            ],
          },
          {
            id: "e3",
            memberLine: "\"I'm about to cancel my membership. This is ridiculous.\"",
            options: [
              { text: "'I understand \u2014 I'd feel the same. Let me stay with you until the truck arrives, then let's talk about making this right.'", delta: -22, feedback: "You matched the moment and offered a concrete follow-up. Beautiful." },
              { text: "'That's your right, sir.'", delta: 15, feedback: "Cold. Even if you can't stop them, don't push them out the door." },
              { text: "'Cancellations go through a different team.'", delta: 20, feedback: "Bureaucratic bounce is escalation fuel." },
            ],
          },
          {
            id: "e4",
            memberLine: "\"Just tell me it's going to be okay.\"",
            options: [
              { text: "'It's going to be okay. I've got your ETA at 12 minutes, and I'm not going anywhere.'", delta: -20, feedback: "Specific + reassuring = safety. Perfect close." },
              { text: "'I can't make any promises.'", delta: 20, feedback: "They're scared. This reads as abandonment." },
              { text: "'Have you tried calling roadside directly?'", delta: 25, feedback: "They ARE calling roadside. Please don't." },
            ],
          },
        ],
      },
    },
    {
      id: "m13", title: "ERS Crossword Coffee Break",
      description: "A quick crossword of AAA and ERS terminology. Coffee optional, cheeky vibes required.",
      category: "product", gameType: "crossword", difficulty: 1, durationMin: 5, xpReward: 150,
      questions: [],
      payload: {
        kind: "crossword",
        clues: [
          { id: "c1", clue: "Membership tier with a 200-mile tow (7 letters).", answer: "PREMIER" },
          { id: "c2", clue: "What we say instead of 'customer' (6 letters).", answer: "MEMBER" },
          { id: "c3", clue: "The truck-sender behind the scenes (8 letters).", answer: "DISPATCH" },
          { id: "c4", clue: "Battery boost service (9 letters, one word).", answer: "JUMPSTART" },
          { id: "c5", clue: "Feeling-first response type (7 letters).", answer: "EMPATHY" },
          { id: "c6", clue: "Keys are inside, member is outside (7 letters).", answer: "LOCKOUT" },
        ],
      },
    },
  ];

  // Backfill quiz missions' payload from their questions.
  return m.map(mi => {
    if (mi.gameType === "quiz" && !mi.payload) {
      return { ...mi, payload: quiz(mi.questions) };
    }
    if (mi.gameType === "quiz" && (mi.payload as any)?.kind !== "quiz") {
      return { ...mi, payload: quiz(mi.questions) };
    }
    return mi;
  });
}

function seedBadges(): Badge[] {
  // Fresh Level 1 state: nothing unlocked yet, all progress at 0.
  return [
    { id: "b1", name: "First Tow", description: "Complete your first mission.", emoji: "\u{1F3AF}", unlocked: false, progress: 0 },
    { id: "b2", name: "Warm Heart", description: "Ace 3 Empathy missions.", emoji: "\u{1F497}", unlocked: false, progress: 0 },
    { id: "b3", name: "Fire Extinguisher", description: "Complete 5 De-escalation missions.", emoji: "\u{1F9EF}", unlocked: false, progress: 0 },
    { id: "b4", name: "Streak Starter", description: "Learn 3 days in a row.", emoji: "\u{1F525}", unlocked: false, progress: 0 },
    { id: "b5", name: "Week Warrior", description: "Maintain a 7-day streak.", emoji: "\u{26A1}", unlocked: false, progress: 0 },
    { id: "b6", name: "ERS Guru", description: "Ace every ERS Know-How mission.", emoji: "\u{1F5FA}\u{FE0F}", unlocked: false, progress: 0 },
    { id: "b7", name: "Compliance Champion", description: "Complete every Compliance mission.", emoji: "\u{1F6E1}\u{FE0F}", unlocked: false, progress: 0 },
    { id: "b8", name: "Perfect Ear", description: "Score 100% on 3 Listening missions.", emoji: "\u{1F442}", unlocked: false, progress: 0 },
    { id: "b9", name: "Roadside Legend", description: "Reach Level 10.", emoji: "\u{1F451}", unlocked: false, progress: 0 },
    { id: "b10", name: "Marathoner", description: "30-day learning streak.", emoji: "\u{1F3C3}", unlocked: false, progress: 0 },
    { id: "b11", name: "Team Player", description: "Rank top-5 on the leaderboard.", emoji: "\u{1F91D}", unlocked: false, progress: 0 },
    { id: "b12", name: "Perfectionist", description: "Complete a mission with 100% accuracy.", emoji: "\u{2728}", unlocked: false, progress: 0 },
    { id: "b13", name: "Word Wizard", description: "Solve a full Word Scramble under time.", emoji: "\u{1F524}", unlocked: false, progress: 0 },
    { id: "b14", name: "Meter Master", description: "Finish an Escalation Meter mission in the green.", emoji: "\u{1F6A6}", unlocked: false, progress: 0 },
  ];
}

function seedLeaderboard(currentUserName: string): LeaderboardEntry[] {
  // Teammates keep realistic XP so the leaderboard is populated, but the current user starts at 0.
  const base = [
    { name: "Maria Sanchez", avatar: "\u{1F929}", weekXp: 1420, monthXp: 5230, allTimeXp: 21400, level: 9, streak: 12 },
    { name: "Stacie Pate", avatar: "\u{1F60E}", weekXp: 1310, monthXp: 4980, allTimeXp: 19850, level: 8, streak: 9 },
    { name: "Kim Allen", avatar: "\u{1F98A}", weekXp: 1050, monthXp: 4210, allTimeXp: 16900, level: 7, streak: 5 },
    { name: "Barry Belcher", avatar: "\u{1F43B}", weekXp: 980, monthXp: 3860, allTimeXp: 15200, level: 7, streak: 4 },
    { name: "Ryan Carrillo", avatar: "\u{1F981}", weekXp: 890, monthXp: 3540, allTimeXp: 14100, level: 6, streak: 3 },
    { name: "Cruz Castaneda", avatar: "\u{1F427}", weekXp: 820, monthXp: 3210, allTimeXp: 12800, level: 6, streak: 6 },
    { name: "Krystal Gathings", avatar: "\u{1F984}", weekXp: 760, monthXp: 2980, allTimeXp: 11400, level: 5, streak: 2 },
    { name: "Lorene Brownlee", avatar: "\u{1F43C}", weekXp: 690, monthXp: 2740, allTimeXp: 10200, level: 5, streak: 4 },
    { name: "Bobby Gonzalez", avatar: "\u{1F989}", weekXp: 610, monthXp: 2510, allTimeXp: 9100, level: 4, streak: 1 },
    { name: "Maria Ballesteros", avatar: "\u{1F42C}", weekXp: 540, monthXp: 2210, allTimeXp: 7800, level: 4, streak: 2 },
    { name: "Julio Vasquez", avatar: "\u{1F428}", weekXp: 470, monthXp: 1980, allTimeXp: 6500, level: 3, streak: 1 },
    { name: currentUserName, avatar: "\u{1F3A7}", weekXp: 0, monthXp: 0, allTimeXp: 0, level: 1, streak: 0, isCurrentUser: true },
  ];
  return base.map((b, i) => ({ ...b, id: `lb${i + 1}` }));
}

function seedActivity(): ActivityEntry[] {
  // Fresh start: no activity yet. The dashboard's empty state will show a friendly welcome.
  return [];
}

function seedXpHistory(): { date: string; xp: number }[] {
  // Fresh start: 30 days of zero XP. Chart will show a flat baseline ready to grow.
  const arr: { date: string; xp: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    arr.push({ date: d.toISOString().slice(0, 10), xp: 0 });
  }
  return arr;
}

function seedSkills() {
  // Fresh start: all skills at 0.
  return [
    { category: "empathy" as Category, level: 0 },
    { category: "deesc" as Category, level: 0 },
    { category: "product" as Category, level: 0 },
    { category: "compliance" as Category, level: 0 },
    { category: "listening" as Category, level: 0 },
  ];
}

function seedCompletionByCategory() {
  return [
    { category: "empathy" as Category, completed: 0, total: 10 },
    { category: "deesc" as Category, completed: 0, total: 9 },
    { category: "product" as Category, completed: 0, total: 8 },
    { category: "compliance" as Category, completed: 0, total: 6 },
    { category: "listening" as Category, completed: 0, total: 9 },
  ];
}

// -------- Subscription --------
type Listener = () => void;
const listeners: Set<Listener> = new Set();
function notify() { listeners.forEach(l => l()); }
function subscribe(l: Listener) { listeners.add(l); return () => { listeners.delete(l); }; }

// -------- Ensure seeds --------
function ensureAgent(): Agent {
  return memory.ensure<Agent>("agent", () => ({
    id: "me", name: "Kenedi Rogers", handle: "@kenedi", avatar: "\u{1F3A7}",
    totalXp: 0, level: 1, streak: 0, rank: 12,
    jobTitle: "Publications Specialist",
    team: "Long Beach ERS \u2014 Team Bowen",
    manager: "Chuck Bowen",
    managerTitle: "ERS Supervisor",
    officeLocation: "Long Beach, CA",
  }));
}
function ensureMissions(): Mission[] { return memory.ensure<Mission[]>("missions", seedMissions); }
function ensureBadges(): Badge[] { return memory.ensure<Badge[]>("badges", seedBadges); }
function ensureLeaderboard(): LeaderboardEntry[] {
  const agent = ensureAgent();
  return memory.ensure<LeaderboardEntry[]>("leaderboard", () => seedLeaderboard(agent.name));
}
function ensureActivity(): ActivityEntry[] { return memory.ensure<ActivityEntry[]>("activity", seedActivity); }
function ensureProgress(): ProgressRecord[] {
  // Fresh start: no completed missions.
  return memory.ensure<ProgressRecord[]>("progress", () => []);
}
function ensureXpHistory() { return memory.ensure<{ date: string; xp: number }[]>("xpHistory", seedXpHistory); }
function ensureSkills() { return memory.ensure<ReturnType<typeof seedSkills>>("skills", seedSkills); }
function ensureCompletion() { return memory.ensure<ReturnType<typeof seedCompletionByCategory>>("completionByCat", seedCompletionByCategory); }

// -------- Hooks --------
function useMemorySlice<T>(key: string, seed: () => T): T {
  const getSnap = () => memory.ensure<T>(key, seed);
  return useSyncExternalStore(subscribe, getSnap, getSnap);
}

export function useAgent(): Agent { return useMemorySlice<Agent>("agent", () => ensureAgent()); }
export function useMissions(): Mission[] { return useMemorySlice<Mission[]>("missions", () => ensureMissions()); }
export function useMission(id: string | undefined): Mission | undefined {
  const missions = useMissions();
  return missions.find(m => m.id === id);
}
export function useBadges(): Badge[] { return useMemorySlice<Badge[]>("badges", () => ensureBadges()); }
export function useLeaderboard(): LeaderboardEntry[] { return useMemorySlice<LeaderboardEntry[]>("leaderboard", () => ensureLeaderboard()); }
export function useActivity(): ActivityEntry[] { return useMemorySlice<ActivityEntry[]>("activity", () => ensureActivity()); }
export function useProgress(): ProgressRecord[] { return useMemorySlice<ProgressRecord[]>("progress", () => ensureProgress()); }
export function useXpHistory() { return useMemorySlice<{ date: string; xp: number }[]>("xpHistory", () => ensureXpHistory()); }
export function useSkills() { return useMemorySlice<ReturnType<typeof seedSkills>>("skills", () => ensureSkills()); }
export function useCompletionByCategory() { return useMemorySlice<ReturnType<typeof seedCompletionByCategory>>("completionByCat", () => ensureCompletion()); }

// -------- Mutations --------
export function useCompleteMission() {
  return useCallback((missionId: string, correctCount: number, totalCount: number, xp: number) => {
    const agent = ensureAgent();
    const progress = ensureProgress();
    const activity = ensureActivity();
    const accuracy = totalCount > 0 ? correctCount / totalCount : 0;
    const rec: ProgressRecord = {
      missionId, completed: true, accuracy, xpEarned: xp,
      completedAt: new Date().toISOString().slice(0, 10),
    };
    memory.put("progress", [rec, ...progress.filter(p => p.missionId !== missionId)]);
    const missions = ensureMissions();
    const m = missions.find(x => x.id === missionId);
    if (m) {
      const newActivity: ActivityEntry = {
        id: `a-${Date.now()}`, kind: "mission",
        label: `Completed '${m.title}'`,
        detail: `+${xp} XP \u00B7 ${Math.round(accuracy * 100)}% accuracy`,
        emoji: getCategory(m.category).emoji, when: "Just now",
      };
      memory.put("activity", [newActivity, ...activity].slice(0, 12));
    }
    memory.put("agent", { ...agent, totalXp: agent.totalXp + xp });
    notify();
  }, []);
}

export function useUpdateAgent() {
  return useCallback((patch: Partial<Pick<Agent, "name" | "avatar">>) => {
    const agent = ensureAgent();
    memory.put("agent", { ...agent, ...patch });
    notify();
  }, []);
}

export function useIsMissionComplete(missionId: string): boolean {
  const progress = useProgress();
  return progress.some(p => p.missionId === missionId && p.completed);
}

export function useSimulatedLoad(ms = 400): boolean {
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

export const AVATAR_CHOICES = ["\u{1F3A7}", "\u{1F929}", "\u{1F60E}", "\u{1F98A}", "\u{1F43B}", "\u{1F981}", "\u{1F427}", "\u{1F984}", "\u{1F43C}", "\u{1F989}", "\u{1F431}", "\u{1F436}"];
