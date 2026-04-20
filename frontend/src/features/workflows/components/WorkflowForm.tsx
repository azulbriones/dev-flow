import { useState } from 'react';

import type { WorkflowCreate } from '../types';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';

interface WorkflowFormProps {
  onSubmit: (data: WorkflowCreate) => void;
  isLoading?: boolean;
}

export const WorkflowForm = ({ onSubmit, isLoading = false }: WorkflowFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [yamlContent, setYamlContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, yaml_content: yamlContent });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="Descripcion"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">YAML</label>
        <textarea
          value={yamlContent}
          onChange={(e) => setYamlContent(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded font-mono text-sm h-48"
          required
        />
      </div>
      <Button type="submit" isLoading={isLoading}>
        Crear Workflow
      </Button>
    </form>
  );
};