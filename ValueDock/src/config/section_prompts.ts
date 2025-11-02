export const sectionPromptsConfig = {
  sections: [
    {
      id: "overview",
      title: "Overview",
      description: "Executive summary and company background",
      defaultContent: "# Company Overview\n\n[Company Name] is seeking to transform their operations through intelligent automation. This proposal outlines a comprehensive solution to address their key challenges and achieve measurable ROI.\n\n## Current Situation\n- Manual processes creating operational bottlenecks\n- Limited visibility into process efficiency\n- Opportunities for significant cost reduction\n\n## Our Approach\nDockeryAI provides end-to-end workflow automation tailored to your specific needs.",
      aiPrompt: "Generate an executive overview section for a ValueDock proposal. Include: 1) Brief company background from website data, 2) Current situation summary, 3) Our recommended approach. Keep it concise and executive-level (2-3 paragraphs).",
      icon: "FileText"
    },
    {
      id: "challenges",
      title: "Challenges & Goals",
      description: "Client pain points and objectives",
      defaultContent: "# Challenges & Goals\n\n## Key Challenges\n1. **Process Inefficiency**: Manual workflows consuming excessive time and resources\n2. **Error Rates**: Human error in repetitive tasks impacting quality\n3. **Scalability**: Current operations cannot support growth targets\n\n## Strategic Goals\n1. Reduce operational costs by 30%+\n2. Improve process accuracy to 99%+\n3. Enable team to focus on high-value activities",
      aiPrompt: "Based on Fathom meeting transcripts and website analysis, extract and structure: 1) Top 3-5 key challenges the client faces, 2) Their stated goals and objectives, 3) How these align with automation opportunities. Use bullet points and clear headers.",
      icon: "Target"
    },
    {
      id: "roi_summary",
      title: "ROI Summary",
      description: "Financial impact and returns",
      defaultContent: "# ROI Summary\n\n## Financial Impact\n- **Annual Savings**: $XXX,XXX\n- **Implementation Cost**: $XX,XXX\n- **Payback Period**: X months\n- **3-Year ROI**: XXX%\n\n## Value Breakdown\n- Direct labor savings: $XXX,XXX\n- Error reduction savings: $XX,XXX\n- Productivity gains: $XX,XXX\n\n## NPV Analysis\nNet Present Value over 3 years: $XXX,XXX",
      aiPrompt: "Create a concise ROI summary using ValueDock calculated data. Include: 1) Key financial metrics (annual savings, ROI, payback), 2) Value breakdown by category, 3) NPV analysis. Present numbers clearly with proper formatting.",
      icon: "DollarSign"
    },
    {
      id: "solution_summary",
      title: "Solution Summary",
      description: "Proposed automation approach",
      defaultContent: "# Solution Summary\n\n## Automation Strategy\nWe propose implementing intelligent automation across your key business processes:\n\n### Phase 1: Quick Wins (Months 1-2)\n- Process 1: [Name] - XX% automation\n- Process 2: [Name] - XX% automation\n\n### Phase 2: Core Operations (Months 3-4)\n- Process 3: [Name] - XX% automation\n- Process 4: [Name] - XX% automation\n\n### Phase 3: Advanced Workflows (Months 5-6)\n- Process 5: [Name] - XX% automation\n\n## Technology Stack\n- RPA Platform: [Tool]\n- Integration Layer: APIs and webhooks\n- Monitoring: Real-time dashboards",
      aiPrompt: "Generate a solution summary describing the automation implementation. Include: 1) Phased approach with timeline, 2) Specific processes to automate with estimated automation percentages, 3) Technology stack overview. Be specific but not overly technical.",
      icon: "Lightbulb"
    },
    {
      id: "sow",
      title: "Statement of Work",
      description: "Project scope and deliverables",
      defaultContent: "# Statement of Work\n\n## Project Scope\nThis engagement includes:\n\n### Discovery & Design (Weeks 1-2)\n- Process mapping workshops\n- Requirements gathering\n- Solution architecture design\n- ROI validation\n\n### Development & Testing (Weeks 3-8)\n- Workflow automation development\n- Integration with existing systems\n- User acceptance testing\n- Documentation\n\n### Deployment & Training (Weeks 9-10)\n- Production deployment\n- User training sessions\n- Knowledge transfer\n- Go-live support\n\n### Post-Launch Support (Weeks 11-12)\n- Hypercare period (30 days)\n- Performance monitoring\n- Optimization recommendations\n- Ongoing maintenance plan\n\n## Deliverables\n1. Automated workflows (X processes)\n2. Integration documentation\n3. User training materials\n4. Performance dashboards\n5. Monthly ROI reports\n\n## Investment\n- Implementation: $XX,XXX\n- Monthly support: $X,XXX\n\n## Timeline\nTotal project duration: 10-12 weeks",
      aiPrompt: "Create a detailed Statement of Work for the automation project. Include: 1) Project phases with timelines, 2) Specific deliverables, 3) Client responsibilities, 4) Investment summary, 5) Success criteria. Structure it as a formal SOW.",
      icon: "FileCheck"
    }
  ],
  exportFormats: {
    gamma_doc: {
      title: "ValueDock Proposal - {companyName}",
      description: "Comprehensive proposal document with all sections",
      sections: ["overview", "challenges", "roi_summary", "solution_summary", "sow"]
    },
    gamma_deck: {
      title: "ValueDock Presentation - {companyName}",
      description: "Executive presentation deck",
      slides: [
        {
          title: "Overview",
          content: "overview"
        },
        {
          title: "Challenges & Goals",
          content: "challenges"
        },
        {
          title: "ROI Impact",
          content: "roi_summary"
        },
        {
          title: "Our Solution",
          content: "solution_summary"
        },
        {
          title: "Next Steps",
          content: "sow"
        }
      ]
    }
  }
} as const;

export type SectionConfig = typeof sectionPromptsConfig.sections[number];
export type ExportFormats = typeof sectionPromptsConfig.exportFormats;
