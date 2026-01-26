import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { IntentValidation } from "../../services/AI/fetchIntents";

interface IntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: IntentFormData) => Promise<void>;
  editingIntent?: IntentValidation | null;
  isLoading?: boolean;
}

export interface IntentFormData {
  intentType: string;
  validationPrompt: string;
  keywords: {
    english: string[];
    burmese: string[];
  };
  patterns: {
    english: string[];
    burmese: string[];
  };
  strongPatterns: {
    english: string[];
    burmese: string[];
  };
  description: string;
}

export const IntentModal: React.FC<IntentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingIntent,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<IntentFormData>({
    intentType: "",
    validationPrompt: "",
    keywords: {
      english: [""],
      burmese: [""],
    },
    patterns: {
      english: [""],
      burmese: [""],
    },
    strongPatterns: {
      english: [""],
      burmese: [""],
    },
    description: "",
  });

  useEffect(() => {
    if (editingIntent) {
      setFormData({
        intentType: editingIntent.intentType || "",
        validationPrompt: editingIntent.validationPrompt || "",
        keywords: {
          english:
            editingIntent.keywords.english.length > 0
              ? editingIntent.keywords.english
              : [""],
          burmese:
            editingIntent.keywords.burmese.length > 0
              ? editingIntent.keywords.burmese
              : [""],
        },
        patterns: {
          english:
            editingIntent.patterns.english.length > 0
              ? editingIntent.patterns.english
              : [""],
          burmese:
            editingIntent.patterns.burmese.length > 0
              ? editingIntent.patterns.burmese
              : [""],
        },
        strongPatterns: {
          english:
            editingIntent.strongPatterns.english.length > 0
              ? editingIntent.strongPatterns.english
              : [""],
          burmese:
            editingIntent.strongPatterns.burmese.length > 0
              ? editingIntent.strongPatterns.burmese
              : [""],
        },
        description: editingIntent.description || "",
      });
    } else {
      // Reset form for creating new intent
      setFormData({
        intentType: "",
        validationPrompt: "",
        keywords: {
          english: [""],
          burmese: [""],
        },
        patterns: {
          english: [""],
          burmese: [""],
        },
        strongPatterns: {
          english: [""],
          burmese: [""],
        },
        description: "",
      });
    }
  }, [editingIntent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Remove intentType from payload when updating
    const submitData = editingIntent
      ? { ...formData, intentType: undefined }
      : formData;

    await onSave(submitData);
  };

  const addKeyword = (language: "english" | "burmese") => {
    setFormData({
      ...formData,
      keywords: {
        ...formData.keywords,
        [language]: [...formData.keywords[language], ""],
      },
    });
  };

  const removeKeyword = (language: "english" | "burmese", index: number) => {
    const newKeywords = formData.keywords[language].filter(
      (_, i) => i !== index,
    );
    if (newKeywords.length === 0) {
      newKeywords.push("");
    }
    setFormData({
      ...formData,
      keywords: {
        ...formData.keywords,
        [language]: newKeywords,
      },
    });
  };

  const updateKeyword = (
    language: "english" | "burmese",
    index: number,
    value: string,
  ) => {
    const newKeywords = [...formData.keywords[language]];
    newKeywords[index] = value;
    setFormData({
      ...formData,
      keywords: {
        ...formData.keywords,
        [language]: newKeywords,
      },
    });
  };

  const addPattern = (
    type: "patterns" | "strongPatterns",
    language: "english" | "burmese",
  ) => {
    setFormData({
      ...formData,
      [type]: {
        ...formData[type],
        [language]: [...formData[type][language], ""],
      },
    });
  };

  const removePattern = (
    type: "patterns" | "strongPatterns",
    language: "english" | "burmese",
    index: number,
  ) => {
    const newPatterns = formData[type][language].filter((_, i) => i !== index);
    if (newPatterns.length === 0) {
      newPatterns.push("");
    }
    setFormData({
      ...formData,
      [type]: {
        ...formData[type],
        [language]: newPatterns,
      },
    });
  };

  const updatePattern = (
    type: "patterns" | "strongPatterns",
    language: "english" | "burmese",
    index: number,
    value: string,
  ) => {
    const newPatterns = [...formData[type][language]];
    newPatterns[index] = value;
    setFormData({
      ...formData,
      [type]: {
        ...formData[type],
        [language]: newPatterns,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {editingIntent ? "Edit Intent" : "Create Intent"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!editingIntent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Intent Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                  value={formData.intentType}
                  onChange={(e) =>
                    setFormData({ ...formData, intentType: e.target.value })
                  }
                >
                  <option value="">Select intent type</option>
                  <option value="greeting">Greeting</option>
                  <option value="information">Information</option>
                  <option value="purchase">Purchase</option>
                  <option value="feedback">Feedback</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Intent description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {editingIntent && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                placeholder="Intent description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Validation Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Enter the validation prompt for this intent..."
              value={formData.validationPrompt}
              onChange={(e) =>
                setFormData({ ...formData, validationPrompt: e.target.value })
              }
            />
          </div>

          {/* Keywords Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Keywords
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  English Keywords
                </label>
                {formData.keywords.english.map((keyword, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Enter English keyword"
                      value={keyword}
                      onChange={(e) =>
                        updateKeyword("english", index, e.target.value)
                      }
                    />
                    {formData.keywords.english.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyword("english", index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addKeyword("english")}
                  className="text-sm text-primary hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add English Keyword
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Burmese Keywords
                </label>
                {formData.keywords.burmese.map((keyword, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Enter Burmese keyword"
                      value={keyword}
                      onChange={(e) =>
                        updateKeyword("burmese", index, e.target.value)
                      }
                    />
                    {formData.keywords.burmese.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKeyword("burmese", index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addKeyword("burmese")}
                  className="text-sm text-primary hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Burmese Keyword
                </button>
              </div>
            </div>
          </div>

          {/* Patterns Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Patterns
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  English Patterns
                </label>
                {formData.patterns.english.map((pattern, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Enter English pattern"
                      value={pattern}
                      onChange={(e) =>
                        updatePattern(
                          "patterns",
                          "english",
                          index,
                          e.target.value,
                        )
                      }
                    />
                    {formData.patterns.english.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removePattern("patterns", "english", index)
                        }
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addPattern("patterns", "english")}
                  className="text-sm text-primary hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add English Pattern
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Burmese Patterns
                </label>
                {formData.patterns.burmese.map((pattern, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Enter Burmese pattern"
                      value={pattern}
                      onChange={(e) =>
                        updatePattern(
                          "patterns",
                          "burmese",
                          index,
                          e.target.value,
                        )
                      }
                    />
                    {formData.patterns.burmese.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removePattern("patterns", "burmese", index)
                        }
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addPattern("patterns", "burmese")}
                  className="text-sm text-primary hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Burmese Pattern
                </button>
              </div>
            </div>
          </div>

          {/* Strong Patterns Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Strong Patterns
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  English Strong Patterns
                </label>
                {formData.strongPatterns.english.map((pattern, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Enter English strong pattern"
                      value={pattern}
                      onChange={(e) =>
                        updatePattern(
                          "strongPatterns",
                          "english",
                          index,
                          e.target.value,
                        )
                      }
                    />
                    {formData.strongPatterns.english.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removePattern("strongPatterns", "english", index)
                        }
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addPattern("strongPatterns", "english")}
                  className="text-sm text-primary hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add English Strong Pattern
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Burmese Strong Patterns
                </label>
                {formData.strongPatterns.burmese.map((pattern, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Enter Burmese strong pattern"
                      value={pattern}
                      onChange={(e) =>
                        updatePattern(
                          "strongPatterns",
                          "burmese",
                          index,
                          e.target.value,
                        )
                      }
                    />
                    {formData.strongPatterns.burmese.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removePattern("strongPatterns", "burmese", index)
                        }
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addPattern("strongPatterns", "burmese")}
                  className="text-sm text-primary hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Burmese Strong Pattern
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editingIntent ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingIntent ? "Update Intent" : "Create Intent"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
