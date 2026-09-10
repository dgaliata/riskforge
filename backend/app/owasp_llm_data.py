"""OWASP GenAI LLM Top 10 (2026 edition) seed data.

Source: OWASP GenAI LLM Top 10 2026 (published August 2026). Replaces the 2025
list (System Prompt Leakage became Hidden Context Exposure; Excessive Agency
moved to #3). Control IDs keep the LLM01..LLM10 numbering.
"""

# (code, name, description)
OWASP_LLM_CATEGORIES = [
    (
        "LLM01",
        "Prompt Injection",
        "Manipulating LLMs via crafted inputs can lead to unauthorized access, data "
        "breaches, and compromised decision-making. 2026 scope expands to cross-modal "
        "attacks, memory persistence, and agentic blast radius.",
    ),
    (
        "LLM02",
        "Sensitive Information Disclosure",
        "Failure to protect against disclosure of sensitive information in LLM outputs "
        "can result in legal consequences or a loss of competitive advantage.",
    ),
    (
        "LLM03",
        "Excessive Agency",
        "Granting LLMs unchecked autonomy to take action can lead to unintended "
        "consequences, jeopardizing reliability, privacy, and trust. Ranked #3 in 2026 "
        "as agentic deployments become the primary damage surface.",
    ),
    (
        "LLM04",
        "Supply Chain",
        "Depending upon compromised components, services, or datasets undermines system "
        "integrity, causing data breaches and system failures.",
    ),
    (
        "LLM05",
        "Data and Model Poisoning",
        "Tampered training, fine-tuning, or embedding data can impair LLM models, leading "
        "to responses that may compromise security, accuracy, or ethical behavior.",
    ),
    (
        "LLM06",
        "Unbounded Consumption",
        "Overloading LLMs with resource-heavy operations can cause service disruptions and "
        "increased costs, including cost asymmetry and reasoning-model resource drain.",
    ),
    (
        "LLM07",
        "Misinformation",
        "Plausible-but-incorrect LLM output can compromise decision-making and erode trust "
        "as generated content is embedded into workflows and automated actions.",
    ),
    (
        "LLM08",
        "Hidden Context Exposure",
        "Any hidden operational context - retrieved documents, agent memory, application "
        "state, and tool responses - is attack surface for disclosure or manipulation, not "
        "just the system prompt. Replaces the 2025 System Prompt Leakage category.",
    ),
    (
        "LLM09",
        "Vector and Embedding Weaknesses",
        "Vulnerabilities in vector databases and embeddings that can be queried or reversed, "
        "enabling data leakage, adversarial retrieval, and corrupted search results.",
    ),
    (
        "LLM10",
        "Improper Output Handling",
        "Neglecting to validate, sanitize, and treat LLM outputs as untrusted can lead to "
        "downstream exploits including injection into shell/terminal sinks and auto-fetching "
        "renderers.",
    ),
]