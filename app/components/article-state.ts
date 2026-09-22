"use client";
import { useSyncExternalStore } from "react";
import type { ArticleReactions } from "../lib/articles";
type State = { saved?: boolean; reactions?: ArticleReactions; busy?: boolean };
const states = new Map<number, State>();
let version = 0;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export function updateArticleState(id: number, patch: State) { states.set(id, { ...states.get(id), ...patch }); version += 1; listeners.forEach(listener => listener()); }
export function useArticleState(id: number) { return useSyncExternalStore(subscribe, () => states.get(id), () => undefined); }
export function beginAction(id: number) { if (states.get(id)?.busy) return false; updateArticleState(id, { busy: true }); return true; }
export function useSavedArticles<T extends { id: number }>(articles: T[]) { useSyncExternalStore(subscribe, () => version, () => 0); return articles.filter(article => states.get(article.id)?.saved !== false); }
