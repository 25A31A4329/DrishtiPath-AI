/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlertVerbosity, DetectionResult, Language } from '../types';

export interface LabelInfo {
  en: string;
  te: string;
  tePhonetic: string;
  category: 'person' | 'vehicle' | 'animal' | 'furniture' | 'item' | 'safety';
  priorityLevel: number; // 1 = highest (traffic signals, stop signs), 2 = people/vehicles, 3 = obstacles/furniture, 4 = animals, 5 = items
}

/**
 * 80 COCO Dataset object categories mapped with comprehensive Telugu translations
 * and validated priority levels.
 * NOTE: We do NOT label objects dangerous merely because of COCO class (e.g. knife/scissors).
 * We prioritize navigational awareness: signals -> pedestrians/vehicles -> physical obstacles.
 */
export const COCO_LABELS: Record<string, LabelInfo> = {
  person: { en: 'person', te: 'మనిషి', tePhonetic: 'Manishi', category: 'person', priorityLevel: 2 },
  bicycle: { en: 'bicycle', te: 'సైకిల్', tePhonetic: 'Bicycle', category: 'vehicle', priorityLevel: 2 },
  car: { en: 'car', te: 'కారు', tePhonetic: 'Kaaru', category: 'vehicle', priorityLevel: 2 },
  motorcycle: { en: 'motorcycle', te: 'మోటార్ సైకిల్', tePhonetic: 'Motorcycle', category: 'vehicle', priorityLevel: 2 },
  airplane: { en: 'airplane', te: 'విమానం', tePhonetic: 'Vimaanam', category: 'vehicle', priorityLevel: 4 },
  bus: { en: 'bus', te: 'బస్సు', tePhonetic: 'Bussu', category: 'vehicle', priorityLevel: 2 },
  train: { en: 'train', te: 'రైలు', tePhonetic: 'Railu', category: 'vehicle', priorityLevel: 2 },
  truck: { en: 'truck', te: 'లారీ / ట్రక్', tePhonetic: 'Truck', category: 'vehicle', priorityLevel: 2 },
  boat: { en: 'boat', te: 'పడవ', tePhonetic: 'Padava', category: 'vehicle', priorityLevel: 4 },
  'traffic light': { en: 'traffic light', te: 'ట్రాఫిక్ లైట్', tePhonetic: 'Traffic light', category: 'safety', priorityLevel: 1 },
  'fire hydrant': { en: 'fire hydrant', te: 'ఫైర్ హైడ్రెంట్', tePhonetic: 'Fire hydrant', category: 'safety', priorityLevel: 3 },
  'stop sign': { en: 'stop sign', te: 'స్టాప్ బోర్డు', tePhonetic: 'Stop sign', category: 'safety', priorityLevel: 1 },
  'parking meter': { en: 'parking meter', te: 'పార్కింగ్ మీటర్', tePhonetic: 'Parking meter', category: 'item', priorityLevel: 5 },
  bench: { en: 'bench', te: 'బెంచ్', tePhonetic: 'Bench', category: 'furniture', priorityLevel: 3 },
  bird: { en: 'bird', te: 'పక్షి', tePhonetic: 'Pakshi', category: 'animal', priorityLevel: 5 },
  cat: { en: 'cat', te: 'పిల్లి', tePhonetic: 'Pilli', category: 'animal', priorityLevel: 4 },
  dog: { en: 'dog', te: 'కుక్క', tePhonetic: 'Kukka', category: 'animal', priorityLevel: 3 },
  horse: { en: 'horse', te: 'గుర్రం', tePhonetic: 'Gurram', category: 'animal', priorityLevel: 3 },
  sheep: { en: 'sheep', te: 'గొర్రె', tePhonetic: 'Gorre', category: 'animal', priorityLevel: 4 },
  cow: { en: 'cow', te: 'ఆవు', tePhonetic: 'Aavu', category: 'animal', priorityLevel: 3 },
  elephant: { en: 'elephant', te: 'ఏనుగు', tePhonetic: 'Eenugu', category: 'animal', priorityLevel: 3 },
  bear: { en: 'bear', te: 'ఎలుగుబంటి', tePhonetic: 'Elugubanti', category: 'animal', priorityLevel: 3 },
  zebra: { en: 'zebra', te: 'జీబ్రా', tePhonetic: 'Zebra', category: 'animal', priorityLevel: 4 },
  giraffe: { en: 'giraffe', te: 'జిరాఫీ', tePhonetic: 'Giraffe', category: 'animal', priorityLevel: 4 },
  backpack: { en: 'backpack', te: 'బ్యాగ్', tePhonetic: 'Bag', category: 'item', priorityLevel: 5 },
  umbrella: { en: 'umbrella', te: 'గొడుగు', tePhonetic: 'Godugu', category: 'item', priorityLevel: 5 },
  handbag: { en: 'handbag', te: 'చేతి సంచి', tePhonetic: 'Chethi sanchi', category: 'item', priorityLevel: 5 },
  tie: { en: 'tie', te: 'టై', tePhonetic: 'Tie', category: 'item', priorityLevel: 5 },
  suitcase: { en: 'suitcase', te: 'సూట్‌కేస్', tePhonetic: 'Suitcase', category: 'item', priorityLevel: 4 },
  frisbee: { en: 'frisbee', te: 'ఫ్రిస్బీ', tePhonetic: 'Frisbee', category: 'item', priorityLevel: 5 },
  skis: { en: 'skis', te: 'స్కీయింగ్ బల్లలు', tePhonetic: 'Skis', category: 'item', priorityLevel: 5 },
  snowboard: { en: 'snowboard', te: 'స్నోబోర్డ్', tePhonetic: 'Snowboard', category: 'item', priorityLevel: 5 },
  'sports ball': { en: 'sports ball', te: 'బంతి', tePhonetic: 'Banthi', category: 'item', priorityLevel: 5 },
  kite: { en: 'kite', te: 'గాలిపటం', tePhonetic: 'Gaalipatam', category: 'item', priorityLevel: 5 },
  'baseball bat': { en: 'baseball bat', te: 'బేస్‌బాల్ బ్యాట్', tePhonetic: 'Baseball bat', category: 'item', priorityLevel: 5 },
  'baseball glove': { en: 'baseball glove', te: 'బేస్‌బాల్ గ్లౌజ్', tePhonetic: 'Baseball glove', category: 'item', priorityLevel: 5 },
  skateboard: { en: 'skateboard', te: 'స్కేట్‌బోర్డ్', tePhonetic: 'Skateboard', category: 'item', priorityLevel: 4 },
  surfboard: { en: 'surfboard', te: 'సర్ఫ్‌బోర్డ్', tePhonetic: 'Surfboard', category: 'item', priorityLevel: 5 },
  'tennis racket': { en: 'tennis racket', te: 'టెన్నిస్ రాకెట్', tePhonetic: 'Tennis racket', category: 'item', priorityLevel: 5 },
  bottle: { en: 'bottle', te: 'బాటిల్', tePhonetic: 'Bottle', category: 'item', priorityLevel: 5 },
  'wine glass': { en: 'wine glass', te: 'గ్లాసు', tePhonetic: 'Glass', category: 'item', priorityLevel: 5 },
  cup: { en: 'cup', te: 'కప్పు', tePhonetic: 'Cup', category: 'item', priorityLevel: 5 },
  fork: { en: 'fork', te: 'ఫోర్క్ స్పూన్', tePhonetic: 'Fork', category: 'item', priorityLevel: 5 },
  knife: { en: 'knife', te: 'కత్తి', tePhonetic: 'Katthi', category: 'item', priorityLevel: 5 },
  spoon: { en: 'spoon', te: 'స్పూన్', tePhonetic: 'Spoon', category: 'item', priorityLevel: 5 },
  bowl: { en: 'bowl', te: 'గిన్నె', tePhonetic: 'Ginne', category: 'item', priorityLevel: 5 },
  banana: { en: 'banana', te: 'అరటిపండు', tePhonetic: 'Aratipandu', category: 'item', priorityLevel: 5 },
  apple: { en: 'apple', te: 'యాపిల్', tePhonetic: 'Apple', category: 'item', priorityLevel: 5 },
  sandwich: { en: 'sandwich', te: 'శాండ్‌విచ్', tePhonetic: 'Sandwich', category: 'item', priorityLevel: 5 },
  orange: { en: 'orange', te: 'నారింజ పండు', tePhonetic: 'Naarinja pandu', category: 'item', priorityLevel: 5 },
  broccoli: { en: 'broccoli', te: 'బ్రోకలీ', tePhonetic: 'Broccoli', category: 'item', priorityLevel: 5 },
  carrot: { en: 'carrot', te: 'క్యారెట్', tePhonetic: 'Carrot', category: 'item', priorityLevel: 5 },
  'hot dog': { en: 'hot dog', te: 'హాట్ డాగ్', tePhonetic: 'Hot dog', category: 'item', priorityLevel: 5 },
  pizza: { en: 'pizza', te: 'పిజ్జా', tePhonetic: 'Pizza', category: 'item', priorityLevel: 5 },
  donut: { en: 'donut', te: 'డోనట్', tePhonetic: 'Donut', category: 'item', priorityLevel: 5 },
  cake: { en: 'cake', te: 'కేకు', tePhonetic: 'Cake', category: 'item', priorityLevel: 5 },
  chair: { en: 'chair', te: 'కుర్చీ', tePhonetic: 'Kurchi', category: 'furniture', priorityLevel: 3 },
  couch: { en: 'couch', te: 'సోఫా', tePhonetic: 'Sofa', category: 'furniture', priorityLevel: 3 },
  'potted plant': { en: 'potted plant', te: 'పూల కుండీ', tePhonetic: 'Poola kundi', category: 'item', priorityLevel: 4 },
  bed: { en: 'bed', te: 'మంచం', tePhonetic: 'Mancham', category: 'furniture', priorityLevel: 3 },
  'dining table': { en: 'dining table', te: 'డైనింగ్ టేబుల్', tePhonetic: 'Dining table', category: 'furniture', priorityLevel: 3 },
  toilet: { en: 'toilet', te: 'టాయిలెట్', tePhonetic: 'Toilet', category: 'furniture', priorityLevel: 3 },
  tv: { en: 'tv', te: 'టీవీ', tePhonetic: 'TV', category: 'furniture', priorityLevel: 4 },
  laptop: { en: 'laptop', te: 'ల్యాప్‌టాప్', tePhonetic: 'Laptop', category: 'item', priorityLevel: 5 },
  mouse: { en: 'mouse', te: 'మౌస్', tePhonetic: 'Mouse', category: 'item', priorityLevel: 5 },
  remote: { en: 'remote', te: 'రిమోట్', tePhonetic: 'Remote', category: 'item', priorityLevel: 5 },
  keyboard: { en: 'keyboard', te: 'కీబోర్డు', tePhonetic: 'Keyboard', category: 'item', priorityLevel: 5 },
  'cell phone': { en: 'cell phone', te: 'మొబైల్ ఫోన్', tePhonetic: 'Mobile phone', category: 'item', priorityLevel: 5 },
  microwave: { en: 'microwave', te: 'మైక్రోవేవ్ ఒవెన్', tePhonetic: 'Microwave', category: 'item', priorityLevel: 4 },
  oven: { en: 'oven', te: 'ఒవెన్', tePhonetic: 'Oven', category: 'item', priorityLevel: 4 },
  toaster: { en: 'toaster', te: 'టోస్టర్', tePhonetic: 'Toaster', category: 'item', priorityLevel: 5 },
  sink: { en: 'sink', te: 'సింక్', tePhonetic: 'Sink', category: 'furniture', priorityLevel: 4 },
  refrigerator: { en: 'refrigerator', te: 'ఫ్రిడ్జ్', tePhonetic: 'Fridge', category: 'furniture', priorityLevel: 3 },
  book: { en: 'book', te: 'పుస్తకం', tePhonetic: 'Pusthakam', category: 'item', priorityLevel: 5 },
  clock: { en: 'clock', te: 'గడియారం', tePhonetic: 'Gadiyaram', category: 'item', priorityLevel: 5 },
  vase: { en: 'vase', te: 'పూల కూజా', tePhonetic: 'Vase', category: 'item', priorityLevel: 5 },
  scissors: { en: 'scissors', te: 'కత్తెర', tePhonetic: 'Katthera', category: 'item', priorityLevel: 5 },
  'teddy bear': { en: 'teddy bear', te: 'టెడ్డీ బేర్', tePhonetic: 'Teddy bear', category: 'item', priorityLevel: 5 },
  'hair drier': { en: 'hair drier', te: 'హెయిర్ డ్రైయర్', tePhonetic: 'Hair dryer', category: 'item', priorityLevel: 5 },
  toothbrush: { en: 'toothbrush', te: 'టూత్‌బ్రష్', tePhonetic: 'Toothbrush', category: 'item', priorityLevel: 5 },
};

/**
 * Returns translated display name for any COCO class label.
 */
export function getTranslatedLabel(rawClass: string, lang: Language): string {
  const normalized = rawClass.toLowerCase().trim();
  const info = COCO_LABELS[normalized];
  if (!info) {
    return rawClass;
  }
  return lang === 'te' ? info.te : info.en;
}

/**
 * Gets numerical priority score (lower number = higher importance)
 */
export function getObjectPriority(rawClass: string): number {
  const normalized = rawClass.toLowerCase().trim();
  const info = COCO_LABELS[normalized];
  return info ? info.priorityLevel : 5;
}

/**
 * Generates an accessible, directional voice phrase for an individual object.
 */
export function formatDirectionalAlert(
  rawClass: string,
  sector: 'left' | 'ahead' | 'right',
  relativeDistance: 'prominent' | 'moderate' | 'distant',
  lang: Language
): string {
  const normalized = rawClass.toLowerCase().trim();
  const info = COCO_LABELS[normalized];
  const objName = info ? (lang === 'te' ? info.te : info.en) : rawClass;

  if (lang === 'te') {
    if (sector === 'ahead') {
      if (relativeDistance === 'prominent') {
        return `ఎదురుగా అతి దగ్గరలో ${objName}`;
      }
      return `ఎదురుగా ${objName}`;
    } else if (sector === 'left') {
      return `ఎడమ వైపు ${objName}`;
    } else {
      return `కుడి వైపు ${objName}`;
    }
  }

  // English
  if (sector === 'ahead') {
    if (relativeDistance === 'prominent') {
      return `${capitalize(objName)} directly ahead, close`;
    }
    return `${capitalize(objName)} straight ahead`;
  } else if (sector === 'left') {
    return `${capitalize(objName)} on left`;
  } else {
    return `${capitalize(objName)} on right`;
  }
}

/**
 * PART 3: Intelligent Multi-Object Summarizer
 * Summarizes current detections into ONE single concise sentence based on AlertVerbosity.
 * Avoids speaking each object as a separate utterance.
 */
export function summarizeDetections(
  detections: DetectionResult[],
  verbosity: AlertVerbosity,
  lang: Language
): { text: string; primarySector: 'left' | 'ahead' | 'right'; primaryClass: string } | null {
  if (detections.length === 0) return null;

  // Sort detections by:
  // 1. Sector priority: 'ahead' (direct path) first, then 'left', then 'right'
  // 2. Object priority level (lower = more critical)
  // 3. Prominence / bbox size
  const sorted = [...detections].sort((a, b) => {
    const sectorRank = (s: string) => (s === 'ahead' ? 0 : s === 'left' ? 1 : 2);
    const sDiff = sectorRank(a.sector) - sectorRank(b.sector);
    if (sDiff !== 0) return sDiff;

    const pDiff = getObjectPriority(a.class) - getObjectPriority(b.class);
    if (pDiff !== 0) return pDiff;

    const aArea = a.bbox[2] * a.bbox[3];
    const bArea = b.bbox[2] * b.bbox[3];
    return bArea - aArea;
  });

  const primary = sorted[0];

  // 1. MINIMAL VERBOSITY (Default):
  // Focus strictly on the single most prominent obstacle directly ahead (or immediate path).
  if (verbosity === 'minimal') {
    // If there is an ahead detection, speak it concisely
    const aheadItem = sorted.find((d) => d.sector === 'ahead');
    const target = aheadItem || primary;

    const name = target.translatedName;
    let text = '';
    if (lang === 'te') {
      if (target.sector === 'ahead') {
        text = `ఎదురుగా ${name}`;
      } else if (target.sector === 'left') {
        text = `ఎడమ వైపు ${name}`;
      } else {
        text = `కుడి వైపు ${name}`;
      }
    } else {
      if (target.sector === 'ahead') {
        text = `Ahead: ${name}`;
      } else if (target.sector === 'left') {
        text = `Left: ${name}`;
      } else {
        text = `Right: ${name}`;
      }
    }

    return { text, primarySector: target.sector, primaryClass: target.class };
  }

  // 2. BALANCED VERBOSITY:
  // Summarizes up to 2 key items (Ahead + 1 lateral) in ONE sentence.
  if (verbosity === 'balanced') {
    const aheadItem = sorted.find((d) => d.sector === 'ahead');
    const lateralItem = sorted.find((d) => d.sector !== 'ahead');

    if (aheadItem && lateralItem) {
      const aheadName = aheadItem.translatedName;
      const latName = lateralItem.translatedName;
      const latSide = lateralItem.sector === 'left'
        ? (lang === 'te' ? 'ఎడమ వైపు' : 'left')
        : (lang === 'te' ? 'కుడి వైపు' : 'right');

      let text = '';
      if (lang === 'te') {
        text = `ఎదురుగా ${aheadName}. ${latSide} ${latName}.`;
      } else {
        text = `Ahead: ${aheadName}. On ${latSide}: ${latName}.`;
      }
      return { text, primarySector: aheadItem.sector, primaryClass: aheadItem.class };
    }

    // Only one category present
    const single = aheadItem || lateralItem || primary;
    return {
      text: formatDirectionalAlert(single.class, single.sector, single.estimatedRelativeDistance, lang),
      primarySector: single.sector,
      primaryClass: single.class,
    };
  }

  // 3. DETAILED VERBOSITY:
  // Summarizes up to 3 objects across sectors in ONE structured sentence.
  const topItems = sorted.slice(0, 3);
  const aheads = topItems.filter((d) => d.sector === 'ahead').map((d) => d.translatedName);
  const lefts = topItems.filter((d) => d.sector === 'left').map((d) => d.translatedName);
  const rights = topItems.filter((d) => d.sector === 'right').map((d) => d.translatedName);

  const parts: string[] = [];
  if (lang === 'te') {
    if (aheads.length > 0) parts.push(`ఎదురుగా: ${aheads.join(', ')}`);
    if (lefts.length > 0) parts.push(`ఎడమ వైపు: ${lefts.join(', ')}`);
    if (rights.length > 0) parts.push(`కుడి వైపు: ${rights.join(', ')}`);
    const text = parts.join('. ');
    return { text, primarySector: primary.sector, primaryClass: primary.class };
  } else {
    if (aheads.length > 0) parts.push(`Ahead: ${aheads.join(', ')}`);
    if (lefts.length > 0) parts.push(`On left: ${lefts.join(', ')}`);
    if (rights.length > 0) parts.push(`On right: ${rights.join(', ')}`);
    const text = parts.join('. ');
    return { text, primarySector: primary.sector, primaryClass: primary.class };
  }
}

/**
 * PART 4: Summarize Actual Real Detections in Front
 * For voice command: "What is in front of me?" / "Na mundu em undi?"
 * Speaks ONLY actual current detections in sector 'ahead'. Never invents objects.
 */
export function summarizeWhatIsInFront(detections: DetectionResult[], lang: Language): string {
  const aheadDetections = detections.filter((d) => d.sector === 'ahead');

  if (aheadDetections.length === 0) {
    return lang === 'te'
      ? 'ప్రస్తుతం మీ ఎదురుగా ఏ వస్తువులూ గుర్తించబడలేదు. మార్గం స్పష్టంగా ఉంది.'
      : 'No objects detected straight ahead right now. Path is clear.';
  }

  // Deduplicate names
  const uniqueNames = Array.from(new Set(aheadDetections.map((d) => d.translatedName)));

  if (lang === 'te') {
    if (uniqueNames.length === 1) {
      return `మీ ఎదురుగా ${uniqueNames[0]} ఉంది.`;
    }
    return `మీ ఎదురుగా: ${uniqueNames.join(', ')} ఉన్నాయి.`;
  }

  if (uniqueNames.length === 1) {
    return `Straight ahead: ${uniqueNames[0]}.`;
  }
  return `Straight ahead: ${uniqueNames.join(', ')}.`;
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
