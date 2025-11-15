import useMapStore from '../stores/mapStore';
import { translateUIText } from '../services/geminiService';

// Default English translations
export const defaultTranslations = {
  // Header
  header: {
    leaderboard: 'Leaderboard',
    profile: 'Profile',
    admin: 'Admin',
    signOut: 'Sign Out',
    login: 'Login',
  },
  
  // Profile Page
  profile: {
    title: 'User Profile',
    backToMap: 'Back to Map',
    discoveries: 'nodes discovered',
    of: 'of',
    rank: 'Rank',
    points: 'points',
    credentials: 'Credentials',
    yourDiscoveries: 'Discoveries',
    username: 'Username',
    email: 'Email Address',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    enterCurrentPassword: 'Enter current password',
    enterNewPassword: 'Enter new password',
    confirmNewPassword: 'Confirm your new password',
    updateProfile: 'Update Profile',
    updating: 'Updating...',
    requestLocation: 'Request Location',
    noDiscoveriesYet: 'No Discoveries Yet',
    startExploring: 'Start exploring the map to discover cultural heritage nodes!',
    goToMap: 'Go to Map',
    discovered: 'Discovered',
    changePassword: 'Change Password',
    changeEmail: 'Change Email Address (Two-Step Process)',
    newEmail: 'New Email Address',
    howItWorks: 'How it works:',
    step1: 'We send a confirmation link to your',
    currentEmail: 'current email',
    step2: 'Click the link to authorize the change',
    step3: 'We then send a verification link to your',
    newEmailLower: 'new email',
    step4: 'Click the verification link to complete the change',
    logoutWarning: "You'll be logged out automatically for security after starting this process.",
    languageSettings: 'Language Settings',
    selectLanguage: 'Select your preferred language',
  },
  
  // Leaderboard
  leaderboard: {
    title: 'Leaderboard',
    subtitle: 'Top Heritage Explorers',
    yourRank: 'Your Rank',
    noExplorers: 'No explorers yet',
    beFirst: 'Be the first to discover locations!',
    discoveries: 'discoveries',
    howPointsWork: 'How Points Work',
    discoverLocation: 'Discover a Location',
    earnPoints: 'Earn 10 points when you unlock a new cultural node',
  },
  
  // Node Modal
  node: {
    getDirections: 'Get Directions',
    unlockLocation: 'Walk within 100 meters of this location to unlock the full story and historic images.',
    listenToStory: 'Listen to Story',
    pauseStory: 'Pause Story',
    translatedTo: 'Translated to',
  },
  
  // Map Page
  map: {
    findMyPath: 'Find My Path',
    clearRoute: 'Clear Route',
    recenter: 'Recenter',
    locatingYou: 'Locating you...',
  },
  
  // Route Planning
  route: {
    planYourRoute: 'Plan Your Route',
    filterByCategory: 'Filter by Category',
    selectLocationTypes: 'Select which types of locations to visit:',
    howManyLocations: 'How many locations do you want to visit?',
    undiscoveredLocationsAvailable: 'undiscovered locations available',
    howMuchTime: 'How much time do you have? (minutes)',
    includes10Minutes: 'Includes 10 minutes at each location',
    createRoute: 'Create Route',
    cancel: 'Cancel',
    locationRequired: 'Location Required',
    enableLocationAccess: 'Please enable location access to plan your route.',
    allDiscovered: 'All Discovered!',
    congratsAllDiscovered: 'Congratulations! You have discovered all cultural nodes!',
    noMatchingLocations: 'No Matching Locations',
    noUndiscoveredMatch: 'No undiscovered locations match your selected categories.',
    routeCreated: 'Route Created!',
    routeSlightlyOver: 'Route slightly exceeds your time budget but within tolerance',
    routeUses: 'Route uses',
    nearestNeighbor: 'nearest neighbor',
    distance: 'Distance',
    kmWalkingRoute: 'km walking route',
    walkingTime: 'Walking time',
    visitTime: 'Visit time',
    minutes: 'minutes',
    minPerLocation: '10 min per location',
    totalTime: 'Total time',
    withinBudget: 'Within your',
    minuteBudget: 'minute budget',
    slightlyOverApproved: 'Slightly over (approved) your',
    visiting: 'Visiting',
    location: 'location',
    locations: 'locations',
    alwaysClosest: 'always choosing closest unvisited',
    routeOrder: 'Route order',
    calculatingRoute: 'Calculating optimal route...',
    routeTooLong: 'Route Too Long',
    cannotCreateRoute: 'Cannot create a route within your time budget',
    availableTime: 'Available time',
    minimumRouteTime: 'Minimum route time',
    pleaseTry: 'Please try',
    increaseTime: 'Increase your available time',
    startCloser: 'Start from a location closer to the heritage sites',
    routeAdjustmentNeeded: 'Route Adjustment Needed',
    theRouteExceeds: 'The {count}-location route exceeds your time budget',
    yourTimeBudget: 'Your time budget',
    routeWouldRequire: 'Route would require',
    weCanCreate: 'We can create a route with {count} location{s} instead',
    shorterRouteFit: 'This shorter route should fit within your {time} minute budget.',
    wouldYouLike: 'Would you like to create this shorter route?',
    yesCreateShorter: 'Yes, Create Shorter Route',
    noCancel: 'No, Cancel',
    routeCreationFailed: 'Route Creation Failed',
    unableToCreateRoute: 'Unable to create a route that fits your time budget. Please try with more time or fewer locations.',
    failedToCreateRoute: 'Failed to create route. Please ensure you have location access and try again.',
  },
  
  // Categories
  categories: {
    architecture: 'Architecture',
    event: 'Event',
    person: 'Person',
    artifact: 'Artifact',
    scenic: 'Scenic',
  },
  
  // Admin Page
  admin: {
    title: 'Admin Panel',
    createLocation: 'Create Location',
    locationRequests: 'Location Requests',
    approve: 'Approve',
    reject: 'Reject',
    delete: 'Delete',
  },
  
  // Request Location Page
  requestLocation: {
    title: 'Request a Location',
    subtitle: 'Help us expand Timișoara\'s heritage trail',
    backToProfile: 'Back to Profile',
    locationDetails: 'Location Details',
    locationName: 'Location Name',
    locationNamePlaceholder: 'e.g., Old Town Hall',
    description: 'Description & Historical Significance',
    descriptionPlaceholder: 'Describe the location, its history, and why it should be added to the heritage trail...',
    category: 'Category',
    selectCategory: 'Select a category',
    historicalPeriod: 'Historical Period',
    historicalPeriodPlaceholder: 'e.g., 18th Century, 1890-1920',
    gpsCoordinates: 'GPS Coordinates',
    latitudePlaceholder: 'Latitude (e.g., 45.7489)',
    longitudePlaceholder: 'Longitude (e.g., 21.2087)',
    useMyLocation: 'Use My Current Location',
    photos: 'Photos',
    photosDescription: 'Upload up to 10 photos of the location (JPG, PNG)',
    audioStory: 'Audio Story',
    audioDescription: 'Choose how to provide the audio narration for this location',
    uploadYourAudio: 'Upload Your Audio',
    uploadAudioDescription: 'Upload a pre-recorded audio file (MP3, WAV, max 10MB)',
    generateAudio: 'Let Us Generate Audio',
    generateAudioDescription: 'Provide a detailed description and we\'ll create the audio for you',
    uploadAudioFile: 'Upload Audio File',
    changeOption: 'Change Option',
    uploading: 'Uploading...',
    clickToUpload: 'Click to upload audio file',
    audioFileTypes: 'MP3, WAV (max 10MB)',
    audioStoryDescription: 'Audio Story Description',
    write8to10Sentences: 'Write 8-10 sentences describing the location\'s story',
    audioStoryPlaceholder: 'Tell us about this location\'s history, significance, interesting facts, and what makes it special. Be descriptive and engaging - this will be used to generate the audio narration that visitors will hear when they discover this location...',
    audioTip: 'Tip: Write in an engaging, storytelling style. Include historical dates, key figures, and interesting anecdotes.',
    sentences: 'sentences',
    contactInformation: 'Your Contact Information',
    fullName: 'Full Name',
    yourName: 'Your name',
    email: 'Email',
    emailPlaceholder: 'your.email@example.com',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '+40 123 456 789',
    cancel: 'Cancel',
    submitting: 'Submitting...',
    submitRequest: 'Submit Request',
  },
  
  // Home Page
  home: {
    heroTitle: 'Walk Through History in',
    heroSubtitle: 'Discover the stories behind Timișoara\'s iconic landmarks. As you walk through the city, unlock audio narratives, historic photos, and fascinating details about Romania\'s cultural heart.',
    startExploring: 'Start Exploring',
    learnMore: 'Learn More',
    discoverTimisoara: 'Discover Timișoara',
    discoverTimisoaraDesc: 'Explore the rich cultural heritage of Romania\'s first free city with GPS-guided walking tours.',
    audioStories: 'Audio Stories',
    audioStoriesDesc: 'Listen to captivating historical narratives as you approach each heritage location.',
    trackJourney: 'Track Your Journey',
    trackJourneyDesc: 'Build your personal collection of discovered sites and cultural treasures.',
    personalGuide: 'Your Personal Heritage Guide',
    personalGuideDesc: 'Experience Timișoara\'s cultural landmarks like never before with immersive, location-based storytelling.',
    iconicLocations: '8 Iconic Locations',
    iconicLocationsDesc: 'From Victory Square to the Bega Canal, discover the sites that shaped Timișoara\'s history.',
    viewOnMap: 'View on Map',
    readyToExplore: 'Ready to Explore?',
    readyToExploreDesc: 'Start your journey through Timișoara\'s cultural heritage. Allow location access and begin discovering stories waiting around every corner.',
    beginJourney: 'Begin Your Journey',
  },
  
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
  }
};

// Get translation for a key
export function t(key, language = 'en') {
  if (language === 'en') {
    return getNestedValue(defaultTranslations, key) || key;
  }
  
  const store = useMapStore.getState();
  const translatedUI = store.translatedUI[language];
  
  if (translatedUI) {
    return getNestedValue(translatedUI, key) || getNestedValue(defaultTranslations, key) || key;
  }
  
  return getNestedValue(defaultTranslations, key) || key;
}

// Helper to get nested object value by dot notation
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Translate all UI text for a language
export async function translateAllUI(targetLanguage) {
  const store = useMapStore.getState();
  
  // Check if already translated
  if (store.translatedUI[targetLanguage]) {
    return store.translatedUI[targetLanguage];
  }
  
  try {
    const translated = await translateUIText(defaultTranslations, targetLanguage);
    store.setTranslatedUI(targetLanguage, translated);
    return translated;
  } catch (error) {
    console.error('Failed to translate UI:', error);
    return defaultTranslations;
  }
}
