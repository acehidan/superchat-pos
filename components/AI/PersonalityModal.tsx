import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { AIPersonality } from "../../services/AI/fetchAIPersonalities";

interface PersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PersonalityFormData) => Promise<void>;
  editingPersonality?: AIPersonality | null;
  isLoading?: boolean;
}

export interface PersonalityFormData {
  personalityType: string;
  name: string;
  gender: "male" | "female" | "other";
  personalityDescription: string;
  rules: string;
  isActive: boolean;
}

export const PersonalityModal: React.FC<PersonalityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPersonality,
  isLoading = false,
}) => {
  // console.log("editingPersonality", editingPersonality);
  const [formData, setFormData] = useState<PersonalityFormData>({
    personalityType: "",
    name: "",
    gender: "male",
    personalityDescription: "",
    rules: "",
    isActive: true,
  });

  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (editingPersonality) {
      setFormData({
        personalityType: editingPersonality.personalityType || "",
        name: editingPersonality.name || "",
        gender: editingPersonality.gender || "male",
        personalityDescription: editingPersonality.personalityDescription || "",
        rules: editingPersonality.rules || "",
        isActive: editingPersonality.isActive ?? true,
      });
    } else {
      // Reset form for creating new personality
      setFormData({
        personalityType: "",
        name: "",
        gender: "male",
        personalityDescription: "",
        rules: "",
        isActive: true,
      });
    }
  }, [editingPersonality]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const resetForm = () => {
    setFormData({
      personalityType: "",
      name: "",
      gender: "male",
      personalityDescription: "",
      rules: "",
      isActive: true,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {editingPersonality
              ? "Edit AI Personality"
              : "Create AI Personality"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview Toggle Button */}
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-800">Preview</h3>
            <span className="text-sm text-slate-500">
              See how your personality will appear
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors flex items-center gap-2"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Preview
              </>
            )}
          </button>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="p-6 bg-slate-50">
            <div className="bg-white rounded-lg border p-6">
              {/* Preview Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Save className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-slate-800 mb-2">
                    {formData.name || "Personality Name"}
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className="text-sm px-3 py-1 bg-primary/20 text-primary-700 rounded-full font-medium">
                      {formData.personalityType || "Personality Type"}
                    </span>
                    <span className="text-sm px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {formData.gender}
                    </span>
                    <span
                      className={`text-sm px-3 py-1 rounded-full font-medium ${
                        formData.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview Description */}
              <div className="mb-6">
                <h5 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  Description
                </h5>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {formData.personalityDescription ||
                      "Personality description will appear here..."}
                  </p>
                </div>
              </div>

              {/* Preview Rules */}
              <div>
                <h5 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  Behavioral Rules
                </h5>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-700">
                    {formData.rules ? (
                      formData.rules.split("\n").map((line, index) => {
                        if (line.trim() === "") {
                          return <br key={index} />;
                        }

                        // Handle headers
                        if (line.startsWith("#")) {
                          const level = line.match(/^#+/)?.[0].length || 1;
                          const text = line.replace(/^#+\s*/, "");
                          const Tag = `h${Math.min(level + 4, 6)}` as
                            | "h5"
                            | "h6";
                          return React.createElement(
                            Tag,
                            {
                              key: index,
                              className:
                                "font-semibold text-slate-800 mt-3 mb-2",
                            },
                            text,
                          );
                        }

                        // Handle bold text
                        if (line.startsWith("**") && line.endsWith("**")) {
                          const text = line.replace(/\*\*/g, "");
                          return (
                            <p
                              key={index}
                              className="font-semibold text-slate-700 mb-2"
                            >
                              {text}
                            </p>
                          );
                        }

                        // Handle bullet points
                        if (line.startsWith("-")) {
                          const text = line.replace(/^-\s*/, "");
                          return (
                            <div
                              key={index}
                              className="flex items-start gap-3 mb-2"
                            >
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-slate-700 flex-1">{text}</p>
                            </div>
                          );
                        }

                        // Regular text
                        return (
                          <p key={index} className="text-slate-700 mb-2">
                            {line}
                          </p>
                        );
                      })
                    ) : (
                      <p className="text-slate-500 italic">
                        Rules will appear here...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                placeholder="Enter personality name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Personality Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g., friendly, professional"
                value={formData.personalityType}
                onChange={(e) =>
                  setFormData({ ...formData, personalityType: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gender: e.target.value as "male" | "female" | "other",
                  })
                }
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
                value={formData.isActive.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isActive: e.target.value === "true",
                  })
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Personality Description <span className="text-red-500">*</span>
            </label>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <textarea
                required
                rows={10}
                className="w-full bg-transparent resize-none outline-none text-slate-700 leading-relaxed text-lg"
                placeholder="Describe the AI personality characteristics..."
                value={formData.personalityDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    personalityDescription: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rules <span className="text-red-500">*</span>
            </label>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <textarea
                required
                rows={40}
                className="w-full bg-transparent resize-none outline-none text-slate-700 leading-relaxed font-mono text-lg"
                placeholder="Define rules and guidelines for this AI personality..."
                value={formData.rules}
                onChange={(e) =>
                  setFormData({ ...formData, rules: e.target.value })
                }
              />
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
                  {editingPersonality ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingPersonality
                    ? "Update Personality"
                    : "Create Personality"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
