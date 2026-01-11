
import React from 'react';

export const REGIONS = [
  { id: 'sud-est', name: 'Sud-Est (Djerba)', date: '2026-04-03' },
  { id: 'centre-est', name: 'Centre-Est (Sfax)', date: '2026-04-06' },
  { id: 'centre-ouest', name: 'Centre-Ouest (Kairouan)', date: '2026-04-08' },
  { id: 'nord-ouest', name: 'Nord-Ouest (Tabarka)', date: '2026-04-15' },
  { id: 'nationale', name: 'Finale nationale (Tunis)', date: '2026-04-22' },
];

export const THEMES = [
  'Gestion urbaine et territoriale',
  'Déchets et économie circulaire',
  'Adaptation au changement climatique',
  'Gestion administrative et financière',
  'Patrimoine, culture et jeunesse'
] as const;

export type ThemeType = typeof THEMES[number];

export const TECH_SKILLS = [
  'Développement logiciel',
  'Data / Intelligence Artificielle',
  'Design UX / UI',
  'Urbanisme / Aménagement',
  'Environnement / Climat',
  'Gestion / Finance publique',
  'Droit / Réglementation',
  'Communication / Pitch'
];

export const METIER_SKILLS: Record<ThemeType, string[]> = {
  'Gestion urbaine et territoriale': [
    'Urbanisme opérationnel',
    'Mobilité et transport',
    'Services urbains',
    'Gestion foncière'
  ],
  'Déchets et économie circulaire': [
    'Gestion des déchets',
    'Économie circulaire',
    'Compostage et valorisation',
    'Plasturgie'
  ],
  'Adaptation au changement climatique': [
    'Hydrologie et gestion de l\'eau',
    'Risques naturels',
    'Espaces verts et biodiversité',
    'Énergie et climat'
  ],
  'Gestion administrative et financière': [
    'Finances publiques locales',
    'Administration territoriale',
    'Digitalisation des services',
    'Management public'
  ],
  'Patrimoine, culture et jeunesse': [
    'Patrimoine et tourisme',
    'Action culturelle',
    'Jeunesse et participation',
    'Événementiel local'
  ]
};

export const IDEAL_TEAMS: Record<ThemeType, { tech: string[], metier: string[] }> = {
  'Gestion urbaine et territoriale': {
    tech: ['Développement logiciel', 'Data / Intelligence Artificielle', 'Design UX / UI', 'Droit / Réglementation'],
    metier: ['Urbanisme opérationnel']
  },
  'Déchets et économie circulaire': {
    tech: ['Développement logiciel', 'Data / Intelligence Artificielle', 'Environnement / Climat', 'Communication / Pitch'],
    metier: ['Gestion des déchets']
  },
  'Adaptation au changement climatique': {
    tech: ['Développement logiciel', 'Data / Intelligence Artificielle', 'Environnement / Climat', 'Urbanisme / Aménagement', 'Gestion / Finance publique'],
    metier: ['Hydrologie et gestion de l\'eau']
  },
  'Gestion administrative et financière': {
    tech: ['Développement logiciel', 'Design UX / UI', 'Droit / Réglementation', 'Gestion / Finance publique'],
    metier: ['Finances publiques locales']
  },
  'Patrimoine, culture et jeunesse': {
    tech: ['Développement logiciel', 'Design UX / UI', 'Communication / Pitch'],
    metier: ['Patrimoine et tourisme', 'Action culturelle']
  }
};

export const STATUS_COLORS: Record<string, string> = {
  incomplete: 'bg-orange-100 text-orange-700 border-orange-200',
  complete: 'bg-blue-100 text-blue-700 border-blue-200',
  submitted: 'bg-green-100 text-green-700 border-green-200',
  selected: 'bg-emerald-800 text-white border-emerald-900',
  waitlist: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

export const STATUS_LABELS: Record<string, string> = {
  incomplete: 'Incomplète',
  complete: 'Complète',
  submitted: 'Soumise',
  selected: 'Sélectionnée',
  waitlist: 'Attente',
  rejected: 'Rejetée',
};
