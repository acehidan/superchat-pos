import React, { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <textarea
              required
              rows={4}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rules <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none"
              placeholder="Define the rules and guidelines for this AI personality..."
              value={formData.rules}
              onChange={(e) =>
                setFormData({ ...formData, rules: e.target.value })
              }
            />
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
