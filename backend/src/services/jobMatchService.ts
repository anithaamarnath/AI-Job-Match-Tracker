import type { JobMatchInput } from "../validators/jobMatchValidator.js";
import { 
  createJobMatch,
  getJobMatchById,
  deleteJobMatchById,
  getJobMatchesByUserId
 } from "../repositories/jobMatchRepository.js";
 import { getResumeById } from "../repositories/resumeRepository.js";


 import { AppError } from "../utils/AppError.js";

export interface JobMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

interface SkillDefinition {
  name: string;
  aliases: string[];
}

const skills: SkillDefinition[] = [
  {
    name: "JavaScript",
    aliases: ["javascript"],
  },
  {
    name: "TypeScript",
    aliases: ["typescript"],
  },
  {
    name: "React",
    aliases: ["react", "react.js", "reactjs"],
  },
  {
    name: "Node.js",
    aliases: ["node.js", "nodejs", "node js"],
  },
  {
    name: "Express",
    aliases: ["express", "express.js", "expressjs"],
  },
  {
    name: "PostgreSQL",
    aliases: ["postgresql", "postgres", "psql"],
  },
  {
    name: "MySQL",
    aliases: ["mysql"],
  },
  {
    name: "Prisma",
    aliases: ["prisma", "prisma orm"],
  },
  {
    name: "MongoDB",
    aliases: ["mongodb", "mongo db"],
  },
  {
    name: "AWS",
    aliases: ["aws", "amazon web services"],
  },
  {
    name: "Docker",
    aliases: ["docker", "containerization"],
  },
  {
    name: "Git",
    aliases: ["git"],
  },
  {
    name: "GitHub Actions",
    aliases: ["github actions"],
  },
  {
    name: "CI/CD",
    aliases: [
      "ci/cd",
      "ci cd",
      "continuous integration",
      "continuous delivery",
      "continuous deployment",
    ],
  },
  {
    name: "REST API",
    aliases: [
      "rest api",
      "rest apis",
      "restful api",
      "restful apis",
      "restful services",
    ],
  },
  {
    name: "GraphQL",
    aliases: ["graphql"],
  },
  {
    name: "HTML",
    aliases: ["html", "html5"],
  },
  {
    name: "CSS",
    aliases: ["css", "css3"],
  },
  {
    name: "Jest",
    aliases: ["jest"],
  },
  {
    name: "Testing",
    aliases: [
      "testing",
      "unit testing",
      "integration testing",
      "end-to-end testing",
      "e2e testing",
    ],
  },
  {
    name: "Python",
    aliases: ["python"],
  },
  {
    name: "Java",
    aliases: ["java"],
  },
  {
    name: "Salesforce",
    aliases: ["salesforce"],
  },
  {
    name: "Apex",
    aliases: ["apex"],
  },
  {
    name: "Lightning Web Components",
    aliases: ["lightning web components", "lwc"],
  },
];

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s.+/#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const containsSkill = (
  text: string,
  aliases: string[]
): boolean => {
  return aliases.some((alias) =>
    text.includes(normalizeText(alias))
  );
};

export const analyzeJobMatch = async (
  userId: string,
  data: JobMatchInput
): Promise<JobMatchResult> => {
  const resume = await getResumeById(
    userId,
    data.resumeId
  );

   if (!resume) {
    throw new AppError("Resume not found", 404);
  }
  const resumeText = resume.extractedText;
  const jobDescription = data.jobDescription;

  const requiredSkills = skills.filter((skill) =>
    containsSkill(jobDescription, skill.aliases)
  );

  const matchedSkills = requiredSkills
    .filter((skill) =>
      containsSkill(resumeText, skill.aliases)
    )
    .map((skill) => skill.name);

  const missingSkills = requiredSkills
    .filter(
      (skill) =>
        !containsSkill(resumeText, skill.aliases)
    )
    .map((skill) => skill.name);

  const matchScore =
    requiredSkills.length === 0
      ? 0
      : Math.round(
          (matchedSkills.length /
            requiredSkills.length) *
            100
        );

  const recommendations =
    requiredSkills.length === 0
      ? [
          "No recognized technical skills were found in the job description.",
        ]
      : missingSkills.length === 0
        ? [
            "Your resume matches all identified skills in the job description.",
          ]
        : missingSkills.map(
            (skill) =>
              `Consider adding relevant experience, projects, or achievements involving ${skill}.`
          );

  const result: JobMatchResult = {
    matchScore,
    matchedSkills,
    missingSkills,
    recommendations,
  };

  await createJobMatch({
    userId,
    resume: resumeText,
    jobDescription: data.jobDescription,
    matchScore: result.matchScore,
    matchedSkills: result.matchedSkills,
    missingSkills: result.missingSkills,
    recommendations: result.recommendations,
  });

  return result;
};

export const getMatchHistory = async (userId: string) => {
  return getJobMatchesByUserId(userId);
};

export const getMatchHistoryById = async (
  userId: string,
  matchId: string
) => {
  const match = await getJobMatchById(userId, matchId);

  if (!match) {
    throw new AppError("Job match result not found", 404);
  }

  return match;
};

export const deleteMatchHistoryById = async (
  userId: string,
  matchId: string
) => {
  const result = await deleteJobMatchById(userId, matchId);

  if (result.count === 0) {
    throw new AppError("Job match result not found", 404);
  }
};


