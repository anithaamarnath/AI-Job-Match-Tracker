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
    name: "Java",
    aliases: ["java"],
  },
  {
    name: "Python",
    aliases: ["python"],
  },
  {
    name: "PHP",
    aliases: ["php"],
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
    name: "Prisma",
    aliases: ["prisma", "prisma orm"],
  },
  {
    name: "AWS",
    aliases: ["aws", "amazon web services"],
  },
  {
    name: "Azure",
    aliases: ["azure", "microsoft azure"],
  },
  {
    name: "Docker",
    aliases: ["docker", "containerization", "containers"],
  },
  {
    name: "Kubernetes",
    aliases: ["kubernetes", "k8s"],
  },
  {
    name: "Linux",
    aliases: ["linux", "unix"],
  },
  {
    name: "Git",
    aliases: ["git", "github", "gitlab"],
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
      "restful services",
    ],
  },
  {
    name: "GraphQL",
    aliases: ["graphql"],
  },
  {
    name: "Microservices",
    aliases: ["microservices", "microservice architecture"],
  },
  {
    name: "Distributed Systems",
    aliases: ["distributed systems", "distributed computing"],
  },
  {
    name: "System Design",
    aliases: ["system design", "software architecture"],
  },
  {
    name: "Unit Testing",
    aliases: ["unit testing", "unit tests", "jest", "vitest"],
  },
  {
    name: "Integration Testing",
    aliases: ["integration testing", "integration tests"],
  },
  {
    name: "End-to-End Testing",
    aliases: ["end-to-end testing", "e2e testing", "cypress", "playwright"],
  },
  {
    name: "Redis",
    aliases: ["redis", "caching"],
  },
  {
    name: "Kafka",
    aliases: ["kafka", "apache kafka", "event streaming"],
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
    .replace(/[^\w\s.+#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const containsAlias = (
  normalizedText: string,
  alias: string
): boolean => {
  const normalizedAlias = normalizeText(alias);

  const pattern = new RegExp(
    `(^|\\s)${escapeRegex(normalizedAlias)}(?=\\s|$|[.,;:/()+#-])`,
    "i"
  );

  return pattern.test(normalizedText);
};

export const detectSkills = (
  resumeText: string
): string[] => {
  const normalizedText = normalizeText(resumeText);

  return skillDefinitions
    .filter((skill) =>
      skill.aliases.some((alias) =>
        containsAlias(normalizedText, alias)
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