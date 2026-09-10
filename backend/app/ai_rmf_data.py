"""NIST AI RMF 1.0 (NIST AI 100-1) seed data: 4 functions, 19 categories, 72 subcategories."""

AI_FUNCTIONS = [
    {
        "code": "GOVERN",
        "name": "GOVERN",
        "description": (
            "Cultivates a risk-management culture and governance structures. Cross-cutting; "
            "applies continuously across the entire AI lifecycle."
        ),
        "sort_order": 1,
    },
    {
        "code": "MAP",
        "name": "MAP",
        "description": (
            "Establishes context to frame AI risks: intended uses, impacts, benefits and "
            "costs, and third-party risks. Informs the go/no-go decision."
        ),
        "sort_order": 2,
    },
    {
        "code": "MEASURE",
        "name": "MEASURE",
        "description": (
            "Employs quantitative and qualitative tools to analyze, assess, benchmark and "
            "monitor AI risk and trustworthiness via test, evaluation, validation and "
            "verification (TEVV)."
        ),
        "sort_order": 3,
    },
    {
        "code": "MANAGE",
        "name": "MANAGE",
        "description": (
            "Allocates resources to mapped and measured risks; risk treatment, response, "
            "recovery, communication and continual improvement for deployed systems."
        ),
        "sort_order": 4,
    },
]

AI_CATEGORIES = [
    # --- GOVERN ---
    ("GOVERN", "GOV-1", "Policies, processes, procedures, and practices across the organization related to the mapping, measuring, and managing of AI risks are in place, transparent, and implemented effectively", 1),
    ("GOVERN", "GOV-2", "Accountability structures are in place so that the appropriate teams and individuals are empowered, responsible, and trained for mapping, measuring, and managing AI risks", 2),
    ("GOVERN", "GOV-3", "Workforce diversity, equity, inclusion, and accessibility processes are prioritized in the mapping, measuring, and managing of AI risks throughout the lifecycle", 3),
    ("GOVERN", "GOV-4", "Organizational teams are committed to a culture that considers and communicates AI risk", 4),
    ("GOVERN", "GOV-5", "Processes are in place for robust engagement with relevant AI actors", 5),
    ("GOVERN", "GOV-6", "Policies and procedures are in place to address AI risks and benefits arising from third-party software and data and other supply chain issues", 6),
    # --- MAP ---
    ("MAP", "MAP-1", "Context is established and understood", 1),
    ("MAP", "MAP-2", "Categorization of the AI system is performed", 2),
    ("MAP", "MAP-3", "AI capabilities, targeted usage, goals, and expected benefits and costs compared with appropriate benchmarks are understood", 3),
    ("MAP", "MAP-4", "Risks and benefits are mapped for all components of the AI system including third-party software and data", 4),
    ("MAP", "MAP-5", "Impacts to individuals, groups, communities, organizations, and society are characterized", 5),
    # --- MEASURE ---
    ("MEASURE", "MEAS-1", "Appropriate methods and metrics are identified and applied", 1),
    ("MEASURE", "MEAS-2", "AI systems are evaluated for trustworthy characteristics", 2),
    ("MEASURE", "MEAS-3", "Mechanisms for tracking identified AI risks over time are in place", 3),
    ("MEASURE", "MEAS-4", "Feedback about efficacy of measurement is gathered and assessed", 4),
    # --- MANAGE ---
    ("MANAGE", "MNG-1", "AI risks based on assessments and other analytical output from the MAP and MEASURE functions are prioritized, responded to, and managed", 1),
    ("MANAGE", "MNG-2", "Strategies to maximize AI benefits and minimize negative impacts are planned, prepared, implemented, documented, and informed by input from relevant AI actors", 2),
    ("MANAGE", "MNG-3", "AI risks and benefits from third-party entities are managed", 3),
    ("MANAGE", "MNG-4", "Risk treatments, including response and recovery, and communication plans for the identified and measured AI risks are documented and monitored regularly", 4),
]

# (category_code, subcategory_code, description)
AI_SUBCATEGORIES = [
    # GOV-1
    ("GOV-1", "GOV-1.1", "Legal and regulatory requirements involving AI are understood, managed, and documented"),
    ("GOV-1", "GOV-1.2", "The characteristics of trustworthy AI are integrated into organizational policies, processes, procedures, and practices"),
    ("GOV-1", "GOV-1.3", "Processes, procedures, and practices are in place to determine the needed level of risk management activities based on the organization's risk tolerance"),
    ("GOV-1", "GOV-1.4", "The risk management process and its outcomes are established through transparent policies, procedures, and other controls based on organizational risk priorities"),
    ("GOV-1", "GOV-1.5", "Ongoing monitoring and periodic review of the risk management process and its outcomes are planned and organizational roles and responsibilities clearly defined"),
    ("GOV-1", "GOV-1.6", "Mechanisms are in place to inventory AI systems and are resourced according to organizational risk priorities"),
    ("GOV-1", "GOV-1.7", "Processes and procedures are in place for decommissioning and phasing out AI systems safely and in a manner that does not increase risks or decrease the organization's trustworthiness"),
    # GOV-2
    ("GOV-2", "GOV-2.1", "Roles and responsibilities and lines of communication related to mapping, measuring, and managing AI risks are documented and are clear to individuals and teams throughout the organization"),
    ("GOV-2", "GOV-2.2", "The organization's personnel and partners receive AI risk management training to enable them to perform their duties and responsibilities consistent with related policies, procedures, and agreements"),
    ("GOV-2", "GOV-2.3", "Executive leadership of the organization takes responsibility for decisions about risks associated with AI system development and deployment"),
    # GOV-3
    ("GOV-3", "GOV-3.1", "Decision-making related to mapping, measuring, and managing AI risks throughout the lifecycle is informed by a diverse team (e.g., diversity of demographics, disciplines, experience, expertise, and backgrounds)"),
    ("GOV-3", "GOV-3.2", "Policies and procedures are in place to define and differentiate roles and responsibilities for human-AI configurations and oversight of AI systems"),
    # GOV-4
    ("GOV-4", "GOV-4.1", "Organizational policies and practices are in place to foster a critical thinking and safety-first mindset in the design, development, deployment, and uses of AI systems to minimize potential negative impacts"),
    ("GOV-4", "GOV-4.2", "Organizational teams document the risks and potential impacts of the AI technology they design, develop, deploy, evaluate, and use, and they communicate about the impacts more broadly"),
    ("GOV-4", "GOV-4.3", "Organizational practices are in place to enable AI testing, identification of incidents, and information sharing"),
    # GOV-5
    ("GOV-5", "GOV-5.1", "Organizational policies and practices are in place to collect, consider, prioritize, and integrate feedback from those external to the team that developed or deployed the AI system regarding potential individual and societal impacts related to AI risks"),
    ("GOV-5", "GOV-5.2", "Mechanisms are established to enable the team that developed or deployed AI systems to regularly incorporate adjudicated feedback from relevant AI actors into system design and implementation"),
    # GOV-6
    ("GOV-6", "GOV-6.1", "Policies and procedures are in place that address AI risks associated with third-party entities, including risks of infringement of a third-party's intellectual property or other rights"),
    ("GOV-6", "GOV-6.2", "Contingency processes are in place to handle failures or incidents in third-party data or AI systems deemed to be high-risk"),
    # MAP-1
    ("MAP-1", "MAP-1.1", "Intended purposes, potentially beneficial uses, context-specific laws, norms and expectations, and prospective settings in which the AI system will be deployed are understood and documented"),
    ("MAP-1", "MAP-1.2", "Interdisciplinary AI actors, competencies, skills, and capacities for establishing context reflect demographic diversity and broad domain and user experience expertise"),
    ("MAP-1", "MAP-1.3", "The organization's mission and relevant goals for AI technology are understood and documented"),
    ("MAP-1", "MAP-1.4", "The business value or context of business use has been clearly defined or \u2013 in the case of assessing existing AI systems \u2013 re-evaluated"),
    ("MAP-1", "MAP-1.5", "Organizational risk tolerances are determined and documented"),
    ("MAP-1", "MAP-1.6", "System requirements are elicited from and understood by relevant AI actors. Design decisions take socio-technical implications into account to address AI risks"),
    # MAP-2
    ("MAP-2", "MAP-2.1", "The specific tasks and methods used to implement the tasks that the AI system will support are defined (e.g., classifiers, generative models, recommenders)"),
    ("MAP-2", "MAP-2.2", "Information about the AI system's knowledge limits and how system output may be utilized and overseen by humans is documented"),
    ("MAP-2", "MAP-2.3", "Scientific integrity and TEVV considerations are identified and documented, including experimental design, data collection and selection, trustworthiness, and construct validation"),
    # MAP-3
    ("MAP-3", "MAP-3.1", "Potential benefits of intended AI system functionality and performance are examined and documented"),
    ("MAP-3", "MAP-3.2", "Potential costs, including non-monetary costs, which result from expected or realized AI errors or system functionality and trustworthiness are examined and documented"),
    ("MAP-3", "MAP-3.3", "Targeted application scope is specified and documented based on the system's capability, established context, and AI system categorization"),
    ("MAP-3", "MAP-3.4", "Processes for operator and practitioner proficiency with AI system performance and trustworthiness are defined, assessed, and documented"),
    ("MAP-3", "MAP-3.5", "Processes for human oversight are defined, assessed, and documented in accordance with organizational policies from the govern function"),
    # MAP-4
    ("MAP-4", "MAP-4.1", "Approaches for mapping AI technology and legal risks of its components are in place, followed, and documented, as are risks of infringement of a third party's intellectual property or other rights"),
    ("MAP-4", "MAP-4.2", "Internal risk controls for components of the AI system, including third-party AI technologies, are identified and documented"),
    # MAP-5
    ("MAP-5", "MAP-5.1", "Likelihood and magnitude of each identified impact (both potentially beneficial and harmful) based on expected use, past uses, public incident reports, and feedback are identified and documented"),
    ("MAP-5", "MAP-5.2", "Practices and personnel for supporting regular engagement with relevant AI actors and integrating feedback about positive, negative, and unanticipated impacts are in place and documented"),
    # MEAS-1
    ("MEAS-1", "MEAS-1.1", "Approaches and metrics for measurement of AI risks enumerated during the map function are selected for implementation starting with the most significant AI risks"),
    ("MEAS-1", "MEAS-1.2", "Appropriateness of AI metrics and effectiveness of existing controls are regularly assessed and updated, including reports of errors and potential impacts on affected communities"),
    ("MEAS-1", "MEAS-1.3", "Internal experts who did not serve as front-line developers and/or independent assessors are involved in regular assessments and updates"),
    # MEAS-2
    ("MEAS-2", "MEAS-2.1", "Test sets, metrics, and details about the tools used during TEVV are documented"),
    ("MEAS-2", "MEAS-2.2", "Evaluations involving human subjects meet applicable requirements and are representative of the relevant population"),
    ("MEAS-2", "MEAS-2.3", "AI system performance or assurance criteria are measured and demonstrated for conditions similar to deployment settings, and measures are documented"),
    ("MEAS-2", "MEAS-2.4", "The functionality and behavior of the AI system and its components are monitored when in production"),
    ("MEAS-2", "MEAS-2.5", "The AI system to be deployed is demonstrated to be valid and reliable, and limitations of generalizability are documented"),
    ("MEAS-2", "MEAS-2.6", "The AI system is evaluated regularly for safety risks, and the system is demonstrated to be safe with residual negative risk within tolerance"),
    ("MEAS-2", "MEAS-2.7", "AI system security and resilience, as identified in the map function, are evaluated and documented"),
    ("MEAS-2", "MEAS-2.8", "Risks associated with transparency and accountability are examined and documented"),
    ("MEAS-2", "MEAS-2.9", "The AI model is explained, validated, and documented, and AI system output is interpreted within its context to inform responsible use and governance"),
    ("MEAS-2", "MEAS-2.10", "Privacy risk of the AI system is examined and documented"),
    ("MEAS-2", "MEAS-2.11", "Fairness and bias are evaluated and results are documented"),
    ("MEAS-2", "MEAS-2.12", "Environmental impact and sustainability of AI model training and management activities are assessed and documented"),
    ("MEAS-2", "MEAS-2.13", "Effectiveness of the employed TEVV metrics and processes in the measure function are evaluated and documented"),
    # MEAS-3
    ("MEAS-3", "MEAS-3.1", "Approaches, personnel, and documentation are in place to regularly identify and track existing, unanticipated, and emergent AI risks"),
    ("MEAS-3", "MEAS-3.2", "Risk tracking approaches are considered for settings where AI risks are difficult to assess using currently available measurement techniques"),
    ("MEAS-3", "MEAS-3.3", "Feedback processes for end users and impacted communities to report problems and appeal system outcomes are established and integrated"),
    # MEAS-4
    ("MEAS-4", "MEAS-4.1", "Measurement approaches for identifying AI risks are connected to deployment context(s) and informed through consultation with domain experts and other end users"),
    ("MEAS-4", "MEAS-4.2", "Measurement results regarding AI system trustworthiness in deployment context(s) are informed by input from domain experts and relevant AI actors"),
    ("MEAS-4", "MEAS-4.3", "Measurable performance improvements or declines based on consultations and field data about context-relevant risks are identified and documented"),
    # MNG-1
    ("MNG-1", "MNG-1.1", "A determination is made as to whether the AI system achieves its intended purposes and stated objectives and whether development or deployment should proceed"),
    ("MNG-1", "MNG-1.2", "Treatment of documented AI risks is prioritized based on impact, likelihood, and available resources or methods"),
    ("MNG-1", "MNG-1.3", "Responses to the AI risks deemed high priority are developed, planned, and documented. Options can include mitigating, transferring, avoiding, or accepting"),
    ("MNG-1", "MNG-1.4", "Negative residual risks to both downstream acquirers of AI systems and end users are documented"),
    # MNG-2
    ("MNG-2", "MNG-2.1", "Resources required to manage AI risks are taken into account, along with viable non-AI alternative approaches, to reduce the magnitude or likelihood of potential impacts"),
    ("MNG-2", "MNG-2.2", "Mechanisms are in place and applied to sustain the value of deployed AI systems"),
    ("MNG-2", "MNG-2.3", "Procedures are followed to respond to and recover from a previously unknown risk when it is identified"),
    ("MNG-2", "MNG-2.4", "Mechanisms are in place and responsibilities are assigned and understood to supersede, disengage, or deactivate AI systems that demonstrate inconsistent performance (kill switch)"),
    # MNG-3
    ("MNG-3", "MNG-3.1", "AI risks and benefits from third-party resources are regularly monitored, and risk controls are applied and documented"),
    ("MNG-3", "MNG-3.2", "Pre-trained models used for development are monitored as part of regular AI system monitoring and maintenance"),
    # MNG-4
    ("MNG-4", "MNG-4.1", "Post-deployment AI system monitoring plans are implemented, including mechanisms for capturing and evaluating feedback, appeal and override, decommissioning, incident response, and change management"),
    ("MNG-4", "MNG-4.2", "Measurable activities for continual improvements are integrated into AI system updates and include regular engagement with interested parties"),
    ("MNG-4", "MNG-4.3", "Incidents and errors are communicated to relevant AI actors, including affected communities. Processes for tracking, responding to, and recovering are followed and documented"),
]

# NIST AI RMF 1.0 trustworthy characteristics used when measuring AI systems.
TRUST_CHARACTERISTICS = [
    "Valid & Reliable",
    "Safe",
    "Secure & Resilient",
    "Accountable & Transparent",
    "Explainable & Interpretable",
    "Privacy-Enhanced",
    "Fair - with Bias Managed",
]

# GenAI-specific risk categories from NIST AI 600-1 (Generative AI Profile).
GAI_RISK_CATEGORIES = [
    "CBRN Information or Capabilities",
    "Confabulation (Hallucination)",
    "Dangerous, Violent, or Hateful Content",
    "Data Privacy",
    "Environmental Impacts",
    "Harmful Bias and Homogenization",
    "Human-AI Configuration",
    "Information Integrity",
    "Information Security",
    "Intellectual Property",
    "Obscene, Degrading, or Abusive Content",
    "Value Chain and Component Integration",
]

RISK_RESPONSES = ["Mitigate", "Transfer", "Avoid", "Accept"]