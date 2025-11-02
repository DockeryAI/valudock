import { useState } from 'react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface NodeMetadataEditorProps {
  label: string;
  values: string[];
  suggestions: string[];
  onChange: (values: string[]) => void;
  onAddToOrganization: (value: string) => void;
  placeholder?: string;
}

/**
 * Component for editing node metadata (triggers, inputs, outputs, dependencies)
 * Supports:
 * - Adding new items
 * - Selecting from organization-wide suggestions
 * - Per-user deletion (doesn't affect organization-wide list)
 */
export function NodeMetadataEditor({
  label,
  values,
  suggestions,
  onChange,
  onAddToOrganization,
  placeholder = 'Type to add...'
}: NodeMetadataEditorProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    
    // Add to node
    if (!values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    
    // Add to organization if not already there
    if (!suggestions.includes(trimmed)) {
      onAddToOrganization(trimmed);
    }
    
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleRemove = (value: string) => {
    // Remove from this node only (doesn't affect organization-wide list)
    onChange(values.filter(v => v !== value));
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (!values.includes(suggestion)) {
      onChange([...values, suggestion]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter(s => 
    !values.includes(s) && 
    s.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* Current values */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30">
          {values.map(value => (
            <Badge 
              key={value} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {value}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => handleRemove(value)}
              />
            </Badge>
          ))}
        </div>
      )}
      
      {/* Input field */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              } else if (e.key === 'Escape') {
                setShowSuggestions(false);
              }
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="text-sm"
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-48 overflow-auto">
              {filteredSuggestions.map(suggestion => (
                <div
                  key={suggestion}
                  className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          size="sm" 
          onClick={handleAdd}
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Press Enter to add. Click X to remove from this node only.
      </p>
    </div>
  );
}
