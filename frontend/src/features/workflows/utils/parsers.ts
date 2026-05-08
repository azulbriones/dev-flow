/**
 * YAML parsing utilities for workflows
 * Shared between WorkflowsComposer and WorkflowDetail
 */

import type { WorkflowStep } from '../components/WorkflowDetailLayout/types';

export interface ParsedStep {
  name: string;
  status: 'done' | 'in-progress' | 'waiting' | 'failed';
  dependsOn: string[];
}

/** Default YAML template for new workflows */
export const defaultYaml = `name: new-workflow.yaml
version: 1.0.0

steps:
  - name: step-1
    run: echo "Running step 1"

  - name: step-2
    run: echo "Running step 2"
    depends_on: [step-1]

  - name: step-3
    run: echo "Running step 3"
    depends_on: [step-2]`;

/** Parse steps from YAML - extracts name and dependencies */
export function parseYamlSteps(yaml: string): ParsedStep[] {
  const lines = yaml.split('\n');
  const steps: ParsedStep[] = [];
  const currentStep = {
    value: null as { name: string; dependsOn: string[] } | null,
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('- name:')) {
      if (currentStep.value) {
        steps.push({
          name: currentStep.value.name,
          status: 'waiting',
          dependsOn: currentStep.value.dependsOn,
        });
      }
      const name = trimmed.replace('- name:', '').trim().replace(/['"]/g, '');
      currentStep.value = { name, dependsOn: [] };
    }

    if (trimmed.startsWith('depends_on:') || trimmed.startsWith('requires:')) {
      const deps = trimmed.replace(/^(depends_on|requires):/, '').trim();
      const match = new RegExp(/\[(.*?)\]/).exec(deps);
      if (match?.[1] && currentStep.value) {
        currentStep.value.dependsOn = match[1]
          .split(',')
          .map((d) => d.trim().replace(/['"]/g, ''));
      }
    }
  }

  if (currentStep.value) {
    steps.push({
      name: currentStep.value.name,
      status: 'waiting',
      dependsOn: currentStep.value.dependsOn,
    });
  }

  if (steps.length > 0) {
    const ordered = resolveStepOrder(steps);
    ordered[0].status = 'in-progress';
    return ordered;
  }

  return steps;
}

/** Resolve step order using topological sort (Kahn algorithm) */
export function resolveStepOrder(steps: ParsedStep[]): ParsedStep[] {
  if (steps.length === 0) return [];

  const stepMap = new Map<string, ParsedStep>();
  steps.forEach((s) => stepMap.set(s.name, s));

  const inDegree = new Map<string, number>();
  steps.forEach((s) => inDegree.set(s.name, s.dependsOn.length));

  const queue: string[] = [];
  inDegree.forEach((degree, name) => {
    if (degree === 0) queue.push(name);
  });

  const result: ParsedStep[] = [];
  while (queue.length > 0) {
    const name = queue.shift()!;
    const step = stepMap.get(name)!;
    result.push(step);

    steps.forEach((s) => {
      if (s.dependsOn.includes(name)) {
        const newDegree = (inDegree.get(s.name) || 1) - 1;
        inDegree.set(s.name, newDegree);
        if (newDegree === 0) queue.push(s.name);
      }
    });
  }

  return result;
}

/** Generate sample YAML for demo purposes */
export function generateSampleYaml(workflowName: string): string {
  return `# ${workflowName}
version: 1.0.0

steps:
  - name: Checkout
    run: git clone $REPO
  - name: Install
    run: npm install
    depends_on: [Checkout]
  - name: Build
    run: npm run build
    depends_on: [Install]
  - name: Test
    run: npm test
    depends_on: [Build]
  - name: Deploy
    run: npm run deploy
    depends_on: [Test]`;
}

/** Parse steps from YAML content in WorkflowDetail */
export function parseStepsFromYaml(
  yamlContent: string,
  currentStepName?: string
): WorkflowStep[] {
  const lines = yamlContent.split('\n');
  const steps: WorkflowStep[] = [];
  const currentStep = {
    value: null as { name: string; dependsOn: string[] } | null,
  };
  const stepIndex = { value: 0 };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('- name:')) {
      if (currentStep.value?.name) {
        steps.push({
          id: `step-${stepIndex.value++}`,
          name: currentStep.value.name,
          status: currentStep.value.name === currentStepName ? 'running' : 'pending',
          dependsOn: currentStep.value.dependsOn || [],
        });
      }

      const name = trimmed.replace('- name:', '').trim().replace(/['"]/g, '');
      currentStep.value = { name, dependsOn: [] };
    }

    if (trimmed.startsWith('depends_on:') || trimmed.startsWith('requires:')) {
      const deps = trimmed.replace(/^(depends_on|requires):/, '').trim();
      const match = new RegExp(/\[(.*?)\]/).exec(deps);
      if (match?.[1] && currentStep.value) {
        currentStep.value.dependsOn = match[1]
          .split(',')
          .map((d) => d.trim().replace(/['"]/g, ''));
      }
    }
  }

  if (currentStep.value?.name) {
    steps.push({
      id: `step-${stepIndex.value}`,
      name: currentStep.value.name,
      status: currentStep.value.name === currentStepName ? 'running' : 'pending',
      dependsOn: currentStep.value.dependsOn || [],
    });
  }

  return steps;
}
