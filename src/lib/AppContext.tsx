import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "./supabase";
import { Workout, Exercise, Template, BodyWeight, Goal } from "../types";

interface AppContextType {
  workouts: Workout[];
  exercises: Exercise[];
  templates: Template[];
  bodyWeights: BodyWeight[];
  goals: Goal[];
  connected: boolean;
  loading: boolean;
  activeTab: string;
  toast: string | null;
  setActiveTab: (tab: string) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  refetchWorkouts: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [bodyWeights, setBodyWeights] = useState<BodyWeight[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [toast, setToast] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    const { data, error } = await supabase
      .from("workouts")
      .select("*, workout_exercises(*, exercise:exercises(*))")
      .order("date", { ascending: false });
    if (!error) setWorkouts(data ?? []);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [w, ex, t, bw, g] = await Promise.all([
        supabase
          .from("workouts")
          .select("*, workout_exercises(*, exercise:exercises(*))")
          .order("date", { ascending: false }),
        supabase.from("exercises").select("*").order("category"),
        supabase
          .from("templates")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("body_weight")
          .select("*")
          .order("date", { ascending: false }),
        supabase.from("goals").select("*"),
      ]);

      if (!w.error) setWorkouts(w.data ?? []);
      if (!ex.error) setExercises(ex.data ?? []);
      if (!t.error) setTemplates(t.data ?? []);
      if (!bw.error) setBodyWeights(bw.data ?? []);
      if (!g.error) setGoals(g.data ?? []);
      setConnected(true);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const showToast = useCallback((msg: string) => setToast(msg), []);
  const clearToast = useCallback(() => setToast(null), []);

  return (
    <AppContext.Provider
      value={{
        workouts,
        exercises,
        templates,
        bodyWeights,
        goals,
        connected,
        loading,
        activeTab,
        toast,
        setActiveTab,
        showToast,
        clearToast,
        refetchWorkouts: fetchWorkouts,
        refetchAll: fetchAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
