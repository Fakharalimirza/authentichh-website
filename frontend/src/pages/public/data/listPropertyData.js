import {
  TrendingUp, Home, Unlock, Settings, ClipboardCheck,
  Camera, Globe, Star, Sparkles, Key, BarChart3,
} from 'lucide-react';
import DirhamSymbol from '../../../components/public/DirhamSymbol';

// NOTE: All text content for this page lives in the i18n dictionaries
// (see the "list_property" namespace in src/i18n/{en,ar}.json).
// These arrays only carry icons and structural flags; the ListProperty
// component maps them against t('list_property.…') keys.

export const comparisonIcons = [TrendingUp, Home, DirhamSymbol, Unlock, Settings];

export const stepIcons = [ClipboardCheck, Star, Camera, Globe, TrendingUp];

// Which step renders the DTCM fee table
export const stepHasTable = [false, true, false, false, false];

export const serviceIcons = [Camera, Sparkles, Key, BarChart3];

// typeKey maps to a translated label under the "list_property" namespace
export const dtcmFees = [
  { typeKey: 'fee_studio', fee: 370 },
  { typeKey: 'fee_1bd', fee: 370 },
  { typeKey: 'fee_2bd', fee: 670 },
  { typeKey: 'fee_3bd', fee: 970 },
];
