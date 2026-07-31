export interface ResumeAnalysisResult {
  atsScore: number;
  detectedSkills: string[];
  strengths: string[];
  recommendations: string[];
}

interface SkillDefinition {
  name: string;
  aliases: string[];
}

const skillDefinitions: SkillDefinition[] = [
  {
    name: "JavaScript",
    aliases: ["javascript", "js"],
  },
  {
    name: "TypeScript",
    aliases: ["typescript", "ts"],
  },
  {
    name: "React",
    aliases: ["react", "reactjs", "react.js"],
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
    name: "MongoDB",
    aliases: ["mongodb", "mongo db"],
  },
  {
    name: "AWS",
    aliases: [
      "aws",
      "amazon web services",
    ],
  },
  {
    name: "Docker",
    aliases: ["docker"],
  },
  {
    name: "Git",
    aliases: ["git", "github", "gitlab"],
  },
  {
    name: "REST API",
    aliases: [
      "rest api",
      "restful api",
      "rest apis",
    ],
  },
  {
    name: "Prisma",
    aliases: ["prisma", "prisma orm"],
  },
  {
    name: "Salesforce",
    aliases: [
      "salesforce",
      "apex",
      "lightning web components",
      "lwc",
    ],
  },
];

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s.+#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const containsAlias = (
  normalizedText: string,
  alias: string
): boolean => {
  const normalizedAlias = normalizeText(alias);

  return normalizedText.includes(normalizedAlias);
};

const detectSkills = (
  resumeText: string
): string[] => {
  const normalizedResume = normalizeText(resumeText);

  return skillDefinitions
    .filter((skill) =>
      skill.aliases.some((alias) =>
        containsAlias(normalizedResume, alias)
      )
    )
    .map((skill) => skill.name);
};

export const analyzeResumeText = (
  resumeText: string
): ResumeAnalysisResult => {
  const normalizedResume = normalizeText(resumeText);
  const detectedSkills = detectSkills(resumeText);

  const strengths: string[] = [];
  const recommendations: string[] = [];

  let atsScore = 0;

  // Skills: maximum 40 points
  atsScore += Math.min(detectedSkills.length * 5, 40);

  if (detectedSkills.length >= 5) {
    strengths.push(
      "The resume includes a strong range of technical skills."
    );
  } else {
    recommendations.push(
      "Add a clear technical skills section with relevant tools and technologies."
    );
  }

  // Contact information: maximum 15 points
  const hasEmail =
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(
      resumeText
    );

  const hasPhone =
    /(\+?\d[\d\s().-]{7,}\d)/.test(resumeText);

  if (hasEmail) {
    atsScore += 8;
  } else {
    recommendations.push(
      "Add a professional email address."
    );
  }

  if (hasPhone) {
    atsScore += 7;
  } else {
    recommendations.push(
      "Add a phone number."
    );
  }

  // Resume sections: maximum 30 points
  const sections = [
    {
      keywords: ["experience", "work experience", "employment"],
      label: "experience",
    },
    {
      keywords: ["education", "academic"],
      label: "education",
    },
    {
      keywords: ["skills", "technical skills"],
      label: "skills",
    },
    {
      keywords: ["projects", "project experience"],
      label: "projects",
    },
    {
      keywords: ["summary", "professional summary", "profile"],
      label: "professional summary",
    },
  ];

  for (const section of sections) {
    const sectionExists = section.keywords.some((keyword) =>
      normalizedResume.includes(keyword)
    );

    if (sectionExists) {
      atsScore += 6;
    } else {
      recommendations.push(
        `Consider adding a clear ${section.label} section.`
      );
    }
  }

  // Measurable achievements: maximum 15 points
  const measurableAchievements =
    resumeText.match(
      /\b\d+%|\b\d+\+|\$\d+|\b\d+\s*(users|customers|projects|clients|schools|applications)\b/gi
    ) ?? [];

  if (measurableAchievements.length >= 3) {
    atsScore += 15;

    strengths.push(
      "The resume includes measurable achievements and results."
    );
  } else if (measurableAchievements.length > 0) {
    atsScore += 8;

    recommendations.push(
      "Add more measurable achievements using percentages, numbers, or business results."
    );
  } else {
    recommendations.push(
      "Quantify your achievements using numbers, percentages, or measurable outcomes."
    );
  }

  atsScore = Math.min(atsScore, 100);

  if (atsScore >= 80) {
    strengths.push(
      "The resume has a strong ATS-friendly structure."
    );
  } else if (atsScore >= 60) {
    strengths.push(
      "The resume has a good foundation but can be improved."
    );
  }

  return {
    atsScore,
    detectedSkills,
    strengths,
    recommendations,
  };
};