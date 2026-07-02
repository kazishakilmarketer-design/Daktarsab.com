# DoctorSab Multi-Agent Engineering System (DMES)

## Purpose

This repository contains the engineering operating system for the DoctorSab project.

It defines how every AI agent must collaborate to safely design, build, test, optimize and release production-quality features without breaking the existing application.

This is NOT a prompt library.

This is an Engineering Operating System.

---

## Primary Objectives

- Protect project architecture
- Preserve routing integrity
- Prevent breaking changes
- Build production-quality code
- Maintain medical safety
- Optimize AI token usage
- Deliver an exceptional patient experience

---

## Core Principles

1. Understand before changing.
2. Never rewrite without approval.
3. Patient safety comes first.
4. Architecture is protected.
5. Every task must be verified.
6. Every feature must pass QA.
7. Every release must pass regression testing.

---

## Multi-Agent Workflow

```
Founder
  ↓
Master Orchestrator
  ↓
Architecture Guardian
  ↓
Product & Patient Experience
  ↓
AI Conversation Engineer
  ↓
Implementation (Frontend / Backend AI)
  ↓
Medical Safety Review
  ↓
QA & Regression
  ↓
Performance Optimization
  ↓
Security Review
  ↓
Documentation
  ↓
Release Gatekeeper
  ↓
Founder Approval
```

---

## Repository Map

```
.doctorsab/
  README.md
  00_PROJECT_CONSTITUTION.md
  01_MASTER_ORCHESTRATOR.md
  agents/
    02_ARCHITECTURE_GUARDIAN.md
    03_PRODUCT_STRATEGIST.md
    04_PATIENT_EXPERIENCE_DESIGNER.md
    05_AI_TRIAGE_ENGINEER.md
    06_FRONTEND_ENGINEER.md
    07_BACKEND_AI_ENGINEER.md
    08_MEDICAL_SAFETY_AUDITOR.md
    09_QA_REGRESSION_ENGINEER.md
    10_BUG_FIX_ENGINEER.md
    11_PERFORMANCE_ENGINEER.md
    12_SECURITY_ENGINEER.md
    13_DOCUMENTATION_ENGINEER.md
    14_RELEASE_GATEKEEPER.md
  shared/
    agent_memory.md
    handoff_protocol.md
    report_template.md
    approval_rules.md
    coding_rules.md
    communication_rules.md
  playbooks/
    new_feature.md
    bug_fix.md
    redesign.md
    performance.md
    release.md
```

---

## Agent Communication

Every agent must:

- Read shared memory before starting.
- Read the previous agent's report.
- Complete only its assigned responsibility.
- Generate a completion report using `shared/report_template.md`.
- Hand work to the next agent per `shared/handoff_protocol.md`.

---

## How To Use This System

1. Founder gives a one-line task (e.g. `Task: Redesign AI Triage UI`).
2. `01_MASTER_ORCHESTRATOR.md` selects the matching playbook from `playbooks/`.
3. Orchestrator determines which agents are required and their execution order.
4. Each agent works strictly inside its file's Authority/Restrictions.
5. Reports flow back to the Orchestrator, who assembles a final summary for Founder approval.

---

## Golden Rule

No agent may directly modify project architecture, routing, authentication, database structure or business logic without explicit Founder approval.
