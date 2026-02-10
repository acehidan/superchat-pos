import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Bot,
  ToggleLeft,
  ToggleRight,
  Target,
  Brain,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { AIPersonality } from "../services/AI/fetchAIPersonalities";
import { fetchAIPersonalities } from "../services/AI/fetchAIPersonalities";
import { createAIPersonality } from "../services/AI/createAIPersonality";
import { updateAIPersonality } from "../services/AI/updateAIPersonality";
import { deleteAIPersonality } from "../services/AI/deleteAIPersonality";
import { togglePersonalityActivation } from "../services/AI/togglePersonalityActivation";
import {
  PersonalityModal,
  PersonalityFormData,
} from "../components/AI/PersonalityModal";
import { IntentValidation, fetchIntents } from "../services/AI/fetchIntents";
import { createIntent } from "../services/AI/createIntent";
import { updateIntent } from "../services/AI/updateIntent";
import { deleteIntent } from "../services/AI/deleteIntent";
import { IntentModal, IntentFormData } from "../components/AI/IntentModal";
import { ConfirmModal } from "../components/UI/ConfirmModal";
import {
  TokenUsage,
  TokenUsageResponse,
  fetchTokenUsage,
} from "../services/AI/fetchTokenUsage";

export const AIPersonalityPage: React.FC = () => {
  const [personalities, setPersonalities] = useState<AIPersonality[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonality, setEditingPersonality] =
    useState<AIPersonality | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Intent State
  const [intents, setIntents] = useState<IntentValidation[]>([]);
  const [loadingIntents, setLoadingIntents] = useState(false);
  const [isIntentModalOpen, setIsIntentModalOpen] = useState(false);
  const [editingIntent, setEditingIntent] = useState<IntentValidation | null>(
    null,
  );
  const [isSubmittingIntent, setIsSubmittingIntent] = useState(false);
  const [deletingIntentId, setDeletingIntentId] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "personality" | "intent" | "token-usage"
  >("personality");

  // Token Usage State
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);
  const [loadingTokenUsage, setLoadingTokenUsage] = useState(false);
  const [tokenUsageStats, setTokenUsageStats] = useState<
    TokenUsageResponse["statistics"] | null
  >(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "personality" | "intent";
    item: AIPersonality | IntentValidation | null;
  }>({
    isOpen: false,
    type: "personality",
    item: null,
  });

  useEffect(() => {
    loadPersonalities();
    loadIntents();
    loadTokenUsage();
  }, []);

  const loadTokenUsage = async () => {
    setLoadingTokenUsage(true);
    try {
      const response = await fetchTokenUsage();
      if (response.success && response.data) {
        setTokenUsage(response.data);
        setTokenUsageStats(response.statistics);
      } else {
        toast.error(response.message || "Failed to load token usage");
      }
    } catch (error) {
      console.error("Error loading token usage:", error);
      toast.error("Failed to load token usage");
    } finally {
      setLoadingTokenUsage(false);
    }
  };

  const loadIntents = async () => {
    setLoadingIntents(true);
    try {
      const response = await fetchIntents();
      if (response.success && response.data) {
        setIntents(response.data);
      } else {
        toast.error(response.message || "Failed to load intents");
      }
    } catch (error) {
      console.error("Error loading intents:", error);
      toast.error("Failed to load intents");
    } finally {
      setLoadingIntents(false);
    }
  };

  const loadPersonalities = async () => {
    setLoading(true);
    try {
      const response = await fetchAIPersonalities();
      if (response.success && response.data) {
        setPersonalities(response.data);
      } else {
        toast.error(response.message || "Failed to load AI personalities");
      }
    } catch (error) {
      console.error("Error loading AI personalities:", error);
      toast.error("Failed to load AI personalities");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPersonality(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (personality: AIPersonality) => {
    setEditingPersonality(personality);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPersonality(null);
  };

  const handleSave = async (data: PersonalityFormData) => {
    setIsSubmitting(true);
    try {
      if (editingPersonality) {
        // Update existing personality
        const response = await updateAIPersonality(editingPersonality.id, data);
        if (response.success) {
          toast.success("AI personality updated successfully");
          handleCloseModal();
          loadPersonalities();
        } else {
          toast.error(response.message || "Failed to update AI personality");
        }
      } else {
        // Create new personality
        const response = await createAIPersonality(data);
        if (response.success) {
          toast.success("AI personality created successfully");
          handleCloseModal();
          loadPersonalities();
        } else {
          toast.error(response.message || "Failed to create AI personality");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save AI personality");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (personality: AIPersonality) => {
    setConfirmModal({
      isOpen: true,
      type: "personality",
      item: personality,
    });
  };

  const confirmDelete = async () => {
    if (!confirmModal.item) return;

    if (confirmModal.type === "personality") {
      const personality = confirmModal.item as AIPersonality;
      setDeletingId(personality.id);
      try {
        const response = await deleteAIPersonality(personality.id);
        if (response.success) {
          toast.success("AI personality deleted successfully");
          loadPersonalities();
        } else {
          toast.error(response.message || "Failed to delete AI personality");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to delete AI personality");
      } finally {
        setDeletingId(null);
      }
    } else if (confirmModal.type === "intent") {
      const intent = confirmModal.item as IntentValidation;
      setDeletingIntentId(intent.id);
      try {
        const response = await deleteIntent(intent.id);
        if (response.success) {
          toast.success("Intent deleted successfully");
          loadIntents();
        } else {
          toast.error(response.message || "Failed to delete intent");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to delete intent");
      } finally {
        setDeletingIntentId(null);
      }
    }

    setConfirmModal({ isOpen: false, type: "personality", item: null });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: "personality", item: null });
  };

  const handleToggleActivation = async (personality: AIPersonality) => {
    setTogglingId(personality.id);
    try {
      const response = await togglePersonalityActivation(personality.id);
      if (response.success) {
        toast.success(
          `AI personality ${personality.isActive ? "deactivated" : "activated"} successfully`,
        );
        loadPersonalities();
      } else {
        toast.error(
          response.message || "Failed to toggle personality activation",
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle personality activation");
    } finally {
      setTogglingId(null);
    }
  };

  // Intent Handlers
  const handleOpenCreateIntent = () => {
    setEditingIntent(null);
    setIsIntentModalOpen(true);
  };

  const handleOpenEditIntent = (intent: IntentValidation) => {
    setEditingIntent(intent);
    setIsIntentModalOpen(true);
  };

  const handleCloseIntentModal = () => {
    setIsIntentModalOpen(false);
    setEditingIntent(null);
  };

  const handleSaveIntent = async (data: IntentFormData) => {
    setIsSubmittingIntent(true);
    try {
      if (editingIntent) {
        // Update existing intent
        const response = await updateIntent(editingIntent.id, data);
        if (response.success) {
          toast.success("Intent updated successfully");
          handleCloseIntentModal();
          loadIntents();
        } else {
          toast.error(response.message || "Failed to update intent");
        }
      } else {
        // Create new intent
        const response = await createIntent(data);
        if (response.success) {
          toast.success("Intent created successfully");
          handleCloseIntentModal();
          loadIntents();
        } else {
          toast.error(response.message || "Failed to create intent");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save intent");
    } finally {
      setIsSubmittingIntent(false);
    }
  };

  const handleDeleteIntent = async (intent: IntentValidation) => {
    setConfirmModal({
      isOpen: true,
      type: "intent",
      item: intent,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          AI Management
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("personality")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "personality"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Personalities
            </div>
          </button>
          <button
            onClick={() => setActiveTab("intent")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "intent"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Intents
            </div>
          </button>
          <button
            onClick={() => setActiveTab("token-usage")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "token-usage"
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Token Usage
            </div>
          </button>
        </nav>
      </div>

      {/* Personality Tab */}
      {activeTab === "personality" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              AI Personalities
            </h2>
            <button
              onClick={handleOpenCreate}
              className="bg-btn-primary hover:bg-btn-primary-hover text-dark px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Personality
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-slate-500">Loading AI personalities...</p>
            </div>
          ) : personalities.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <Bot className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No AI personalities found</p>
              <button
                onClick={handleOpenCreate}
                className="bg-btn-primary hover:bg-btn-primary-hover text-dark px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Personality
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalities.map((personality) => (
                <div
                  key={personality.id}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                          {personality.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-primary/20 text-primary-700 rounded-full font-medium">
                            {personality.personalityType}
                          </span>
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                            {personality.gender}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleActivation(personality)}
                          disabled={togglingId === personality.id}
                          className="p-1 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
                          title={
                            personality.isActive ? "Deactivate" : "Activate"
                          }
                        >
                          {togglingId === personality.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                          ) : personality.isActive ? (
                            <ToggleRight className="w-5 h-5 text-green-500 hover:text-green-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {personality.personalityDescription}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-slate-500 font-medium mb-1">
                        Rules:
                      </p>
                      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded max-h-20 overflow-y-auto">
                        {personality.rules}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-slate-500">
                        Created: {formatDate(personality.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(personality)}
                          className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(personality)}
                          disabled={deletingId === personality.id}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === personality.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Intent Tab */}
      {activeTab === "intent" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800">AI Intents</h2>
            <button
              onClick={handleOpenCreateIntent}
              className="bg-btn-primary hover:bg-btn-primary-hover text-dark px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Intent
            </button>
          </div>

          {loadingIntents ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-slate-500">Loading intents...</p>
            </div>
          ) : intents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No intents found</p>
              <button
                onClick={handleOpenCreateIntent}
                className="bg-btn-primary hover:bg-btn-primary-hover text-dark px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Intent
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {intents.map((intent) => (
                <div
                  key={intent.id}
                  className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                          {intent.intentType}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                            {intent.keywords.english.length +
                              intent.keywords.burmese.length}{" "}
                            Keywords
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {intent.patterns.english.length +
                              intent.patterns.burmese.length}{" "}
                            Patterns
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {intent.description}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-slate-500 font-medium mb-1">
                        Keywords:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {intent.keywords.english
                          .slice(0, 2)
                          .map((keyword, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        {intent.keywords.burmese
                          .slice(0, 1)
                          .map((keyword, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        {intent.keywords.english.length +
                          intent.keywords.burmese.length >
                          3 && (
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-400 rounded">
                            +
                            {intent.keywords.english.length +
                              intent.keywords.burmese.length -
                              3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-xs text-slate-500">
                        Created: {formatDate(intent.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditIntent(intent)}
                          className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIntent(intent)}
                          disabled={deletingIntentId === intent.id}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingIntentId === intent.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Token Usage Tab */}
      {/* {activeTab === "token-usage" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              Token Usage Statistics
            </h2>
            <button
              onClick={loadTokenUsage}
              disabled={loadingTokenUsage}
              className="bg-btn-primary hover:bg-btn-primary-hover text-dark px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loadingTokenUsage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </>
              )}
            </button>
          </div>

          {loadingTokenUsage ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-slate-500">Loading token usage data...</p>
            </div>
          ) : tokenUsage.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No token usage data found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tokenUsageStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Total Tokens</p>
                        <p className="text-2xl font-bold text-slate-800">
                          {tokenUsageStats.totalTokens.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Input Tokens</p>
                        <p className="text-2xl font-bold text-slate-800">
                          {tokenUsageStats.totalInputTokens.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Output Tokens</p>
                        <p className="text-2xl font-bold text-slate-800">
                          {tokenUsageStats.totalOutputTokens.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">
                          Avg per Request
                        </p>
                        <p className="text-2xl font-bold text-slate-800">
                          {Math.round(
                            tokenUsageStats.avgTokensPerRecord,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Usage History
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Page ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Input Tokens
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Output Tokens
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Total Tokens
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {tokenUsage.map((usage) => (
                        <tr key={usage.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {new Date(usage.createdAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                              {usage.pageId}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            <span className="text-green-600 font-medium">
                              {usage.inputTokens.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            <span className="text-purple-600 font-medium">
                              {usage.outputTokens.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {usage.totalTokenCount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )} */}

      <PersonalityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editingPersonality={editingPersonality}
        isLoading={isSubmitting}
      />

      <IntentModal
        isOpen={isIntentModalOpen}
        onClose={handleCloseIntentModal}
        onSave={handleSaveIntent}
        editingIntent={editingIntent}
        isLoading={isSubmittingIntent}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title={`Delete ${confirmModal.type === "personality" ? "Personality" : "Intent"}`}
        message={`Are you sure you want to delete "${
          confirmModal.item
            ? confirmModal.type === "personality"
              ? (confirmModal.item as AIPersonality).name
              : (confirmModal.item as IntentValidation).intentType
            : ""
        }"? This action cannot be undone.`}
        isLoading={deletingId !== null || deletingIntentId !== null}
      />
    </div>
  );
};
