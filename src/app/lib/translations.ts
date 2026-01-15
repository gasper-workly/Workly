export type LanguageCode = 'en' | 'sl';

export type TranslationKey =
  | 'nav.dashboard'
  | 'nav.myRequests'
  | 'nav.messages'
  | 'nav.analytics'
  | 'nav.profile'
  | 'home.welcomeTo'
  | 'home.subtitle'
  | 'home.providerCard.title'
  | 'home.providerCard.subtitle'
  | 'home.providerCard.signup'
  | 'home.providerCard.login'
  | 'home.clientCard.title'
  | 'home.clientCard.subtitle'
  | 'home.clientCard.signup'
  | 'home.clientCard.login'
  | 'auth.common.or'
  | 'auth.common.choose'
  | 'auth.common.login'
  | 'auth.common.alreadyHaveAccount'
  | 'auth.common.backToHome'
  | 'auth.common.genericError'
  | 'auth.form.fullName'
  | 'auth.form.email'
  | 'auth.form.emailPlaceholder'
  | 'auth.form.dateOfBirth'
  | 'auth.form.dateOfBirthRequired'
  | 'auth.form.telephoneOptional'
  | 'auth.form.telephonePlaceholder'
  | 'auth.form.password'
  | 'auth.form.confirmPassword'
  | 'auth.form.passwordMinHint'
  | 'auth.form.categoriesYouCanDo'
  | 'auth.form.categoriesHelp'
  | 'auth.login.title'
  | 'auth.login.subtitleProvider'
  | 'auth.login.subtitleClient'
  | 'auth.login.noAccount'
  | 'auth.login.signUpNow'
  | 'auth.login.switchToProvider'
  | 'auth.login.switchToClient'
  | 'auth.login.loggingIn'
  | 'auth.login.invalidCredentials'
  | 'auth.signup.client.title'
  | 'auth.signup.client.subtitle'
  | 'auth.signup.provider.title'
  | 'auth.signup.provider.subtitle'
  | 'auth.signup.creatingAccount'
  | 'auth.signup.createAccount'
  | 'auth.signup.ageTooYoung'
  | 'auth.signup.passwordsDoNotMatch'
  | 'auth.signup.minAgeNote'
  | 'onboarding.welcome.title'
  | 'onboarding.welcome.subtitle'
  | 'onboarding.welcome.footer'
  | 'onboarding.common.skip'
  | 'onboarding.common.next'
  | 'onboarding.common.getStarted'
  | 'onboarding.common.termsNotice'
  | 'onboarding.common.step3.title'
  | 'onboarding.common.step3.subtitle'
  | 'onboarding.common.agree.prefix'
  | 'onboarding.common.agree.terms'
  | 'onboarding.common.agree.and'
  | 'onboarding.common.agree.privacy'
  | 'onboarding.common.agree.required'
  | 'onboarding.client.step2.title'
  | 'onboarding.client.step2.bullet1'
  | 'onboarding.client.step2.bullet2'
  | 'onboarding.client.step2.bullet3'
  | 'onboarding.provider.step2.title'
  | 'onboarding.provider.step2.bullet1'
  | 'onboarding.provider.step2.bullet2'
  | 'onboarding.provider.step2.bullet3'
  | 'providerProfilePage.title'
  | 'providerProfilePage.profileLabel'
  | 'providerProfilePage.memberSince'
  | 'providerProfilePage.topline'
  | 'providerProfilePage.actions.done'
  | 'providerProfilePage.actions.openSettings'
  | 'providerProfilePage.actions.changePhoto'
  | 'providerProfilePage.actions.choose'
  | 'providerProfilePage.sections.details'
  | 'providerProfilePage.sections.about'
  | 'providerProfilePage.sections.preferences'
  | 'providerProfilePage.fields.fullName'
  | 'providerProfilePage.fields.email'
  | 'providerProfilePage.fields.telephoneOptional'
  | 'providerProfilePage.fields.telephonePlaceholder'
  | 'providerProfilePage.fields.notProvided'
  | 'providerProfilePage.fields.bio'
  | 'providerProfilePage.fields.bioPlaceholder'
  | 'providerProfilePage.fields.bioNotProvided'
  | 'providerProfilePage.fields.charactersRemaining'
  | 'providerProfilePage.fields.categoriesYouCanDo'
  | 'providerProfilePage.level.new'
  | 'providerProfilePage.level.verified'
  | 'providerProfilePage.level.trusted'
  | 'providerProfilePage.level.expert'
  | 'providerProfilePage.level.shortLabel'
  | 'providerProfilePage.level.lineWithNext'
  | 'providerProfilePage.level.lineMax'
  | 'providerProfilePage.level.reachNext'
  | 'providerProfilePage.level.topLevel'
  | 'providerProfilePage.stats.averageRating'
  | 'providerProfilePage.stats.tasksCompleted'
  | 'providerProfilePage.stats.totalEarnings'
  | 'providerProfilePage.reviews.title'
  | 'providerProfilePage.reviews.sortLabel'
  | 'providerProfilePage.reviews.sort.newest'
  | 'providerProfilePage.reviews.sort.highest'
  | 'providerProfilePage.reviews.sort.lowest'
  | 'providerProfilePage.reviews.empty'
  | 'providerProfilePage.reviews.anonymousClient'
  | 'providerProfilePage.alerts.avatarUploadFailed'
  | 'providerProfilePage.alerts.saveFailed'
  | 'analytics.userNameFallback'
  | 'analytics.timeRange.last7Days'
  | 'analytics.timeRange.thisMonth'
  | 'analytics.timeRange.allTime'
  | 'analytics.earnings.total'
  | 'analytics.earnings.thisMonth'
  | 'analytics.earnings.last7Days'
  | 'analytics.cash.title'
  | 'analytics.cash.amountLabel'
  | 'analytics.cash.dateTimeLabel'
  | 'analytics.cash.noteLabel'
  | 'analytics.cash.amountPlaceholder'
  | 'analytics.cash.notePlaceholder'
  | 'analytics.cash.addButton'
  | 'analytics.cash.addFailed'
  | 'analytics.categories.title'
  | 'analytics.categories.empty'
  | 'analytics.categories.taskCount'
  | 'analytics.trust.title'
  | 'analytics.trust.unlockMessage'
  | 'analytics.trust.badge1'
  | 'analytics.trust.badge2'
  | 'analytics.trust.badge3'
  | 'analytics.trust.maxLevel'
  | 'analytics.trust.currentLabel'
  | 'analytics.trust.nextLabel'
  | 'analytics.reviews.title'
  | 'analytics.reviews.empty'
  | 'analytics.reviews.anonymousClient'
  | 'settings.title'
  | 'settings.account'
  | 'settings.account.editProfile'
  | 'settings.account.clientDesc'
  | 'settings.account.providerDesc'
  | 'settings.notifications'
  | 'settings.notifications.emailUpdates'
  | 'settings.notifications.jobStatusUpdates'
  | 'settings.notifications.emailJobAlerts'
  | 'settings.notifications.ratingUpdates'
  | 'settings.toggle.on'
  | 'settings.toggle.off'
  | 'settings.legal'
  | 'settings.legal.terms'
  | 'settings.legal.privacy'
  | 'settings.support'
  | 'settings.language'
  | 'settings.language.english'
  | 'settings.language.slovenian'
  | 'settings.support.cta'
  | 'settings.support.ctaProvider'
  | 'settings.support.email'
  | 'messages.byRequest.title'
  | 'messages.byRequest.empty.title'
  | 'messages.byRequest.empty.subtitle'
  | 'messages.byRequest.providersInterested'
  | 'messages.byRequest.providersInterestedSingular'
  | 'messages.job.back'
  | 'messages.job.conversationsTitle'
  | 'messages.job.untitledJob'
  | 'messages.job.providerFallback'
  | 'messages.job.empty.title'
  | 'messages.job.empty.subtitle'
  | 'messages.job.providersMessaged'
  | 'messages.job.providersMessagedSingular'
  | 'messages.provider.title'
  | 'messages.provider.empty.title'
  | 'messages.provider.empty.subtitle'
  | 'common.other'
  | 'common.unknown'
  | 'common.loadingUser'
  | 'dashboard.greeting.hi'
  | 'dashboard.client.createRequest'
  | 'dashboard.stats.active'
  | 'dashboard.stats.completed'
  | 'dashboard.stats.messages'
  | 'dashboard.client.myRequests'
  | 'dashboard.client.noRequestsYet'
  | 'dashboard.client.createFirstRequest'
  | 'dashboard.client.noActiveRequests'
  | 'dashboard.client.createNewRequest'
  | 'dashboard.client.viewChats'
  | 'dashboard.client.recentUpdates'
  | 'dashboard.client.noUpdatesYet'
  | 'activity.requestCreated'
  | 'activity.assignedTo'
  | 'activity.completedBy'
  | 'activity.reviewed'
  | 'activity.requestCancelled'
  | 'report.submitted'
  | 'report.submitFailed'
  | 'report.title'
  | 'report.subtitle'
  | 'report.question'
  | 'report.placeholder'
  | 'report.cancel'
  | 'report.submitting'
  | 'report.submit'
  | 'requests.title'
  | 'requests.sortBy'
  | 'requests.sort.newest'
  | 'requests.sort.oldest'
  | 'requests.filter.aria'
  | 'status.all'
  | 'status.open'
  | 'status.completed'
  | 'status.cancelled'
  | 'requests.empty'
  | 'requests.chat.view'
  | 'requests.edit.title'
  | 'requests.edit.submit'
  | 'requests.updateFailed'
  | 'requests.cancelConfirm'
  | 'requests.cancelFailed'
  | 'dashboard.stats.rating'
  | 'dashboard.stats.earnings'
  | 'provider.location.nearYou'
  | 'provider.location.getting'
  | 'provider.filters.category'
  | 'provider.filters.allCategories'
  | 'provider.filters.maxDistance'
  | 'provider.filters.anyDistance'
  | 'provider.filters.sortBy'
  | 'provider.filters.sort.mostRecent'
  | 'provider.filters.sort.highestPrice'
  | 'provider.filters.sort.nearest'
  | 'provider.availableRequests'
  | 'provider.contactClient'
  | 'provider.noAvailableRequests'
  | 'provider.tryAdjustingFilters'
  | 'provider.checkBackLater'
  | 'provider.startChatFailed'
  | 'category.homeMaintenance'
  | 'category.outdoorGarden'
  | 'category.movingTransport'
  | 'category.cleaningMaintenance'
  | 'category.constructionRenovation'
  | 'category.technicalInstallation'
  | 'category.vehicleServices'
  | 'category.personalAssistance'
  | 'category.seasonalMisc'
  | 'common.client'
  | 'newRequest.title'
  | 'newRequest.subtitle'
  | 'newRequest.error.loginRequired'
  | 'newRequest.error.submitFailed'
  | 'form.request.titleLabel'
  | 'form.request.titlePlaceholder'
  | 'form.request.categoryLabel'
  | 'form.request.descriptionLabel'
  | 'form.request.descriptionPlaceholder'
  | 'form.request.locationError'
  | 'form.request.priceLabel'
  | 'form.request.negotiableLabel'
  | 'form.request.photosLabel'
  | 'form.request.photosAdd'
  | 'form.request.photosRemove'
  | 'form.request.submitCreate'
  | 'task.viewDescription'
  | 'task.hideDescription'
  | 'providerProfile.title'
  | 'providerProfile.jobsDoneSingular'
  | 'providerProfile.jobsDonePlural'
  | 'providerProfile.reportButton'
  | 'providerProfile.reviewsTitle'
  | 'providerProfile.noReviews'
  | 'providerProfile.reportModal.title'
  | 'providerProfile.reportModal.subtitlePrefix'
  | 'providerProfile.reportModal.reasonLabel'
  | 'providerProfile.reportModal.placeholder'
  | 'providerProfile.reportModal.cancel'
  | 'providerProfile.reportModal.submit'
  | 'providerProfile.reportAlerts.missingReason'
  | 'providerProfile.reportAlerts.submitted'
  | 'providerProfile.reportAlerts.failed'
  | 'common.completedRequestsSingular'
  | 'common.completedRequestsPlural'
  | 'chat.openTask'
  | 'chat.completedTask'
  | 'chat.markAsCompleted'
  | 'jobDetail.photos'
  | 'jobDetail.noPhotos'
  | 'jobDetail.openPhoto'
  | 'jobDetail.closePhoto'
  | 'jobDetail.completedRequestsLabel'
  | 'jobDetail.chatNow'
  | 'jobDetail.locationApproxArea'
  | 'jobDetail.locationApproxNotAvailable'
  | 'location.loadingMap'
  | 'location.approxAreaSuffix'
  | 'location.approximateLabel'
  | 'task.viewMore'
  | 'common.loading';

export const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.myRequests': 'My Requests',
    'nav.messages': 'Messages',
    'nav.analytics': 'Analytics',
    'nav.profile': 'Profile',

    'home.welcomeTo': 'Welcome to',
    'home.subtitle': 'Connect with reliable service providers or earn money by helping others',
    'home.providerCard.title': 'I want to offer help',
    'home.providerCard.subtitle': 'Start earning money by providing valuable services to people in your area.',
    'home.providerCard.signup': 'Sign up as Provider',
    'home.providerCard.login': 'Log in as Provider',
    'home.clientCard.title': 'I need help with something',
    'home.clientCard.subtitle': 'Find reliable help for your tasks and get things done efficiently.',
    'home.clientCard.signup': 'Sign up as Client',
    'home.clientCard.login': 'Log in as Client',

    'auth.common.or': 'Or',
    'auth.common.choose': 'Choose',
    'auth.common.login': 'Log in',
    'auth.common.alreadyHaveAccount': 'Already have an account?',
    'auth.common.backToHome': '← Back to Home',
    'auth.common.genericError': 'Something went wrong. Please try again.',
    'auth.form.fullName': 'Full Name',
    'auth.form.email': 'Email',
    'auth.form.emailPlaceholder': 'you@example.com',
    'auth.form.dateOfBirth': 'Date of Birth',
    'auth.form.dateOfBirthRequired': 'Date of birth is required.',
    'auth.form.telephoneOptional': 'Telephone (optional)',
    'auth.form.telephonePlaceholder': 'Add your phone number for easier contact',
    'auth.form.password': 'Password',
    'auth.form.confirmPassword': 'Confirm password',
    'auth.form.passwordMinHint': 'Must be at least 8 characters long',
    'auth.form.categoriesYouCanDo': 'Categories you can do',
    'auth.form.categoriesHelp':
      'Choose the types of jobs you want to work on. You can change this later in your profile.',
    'auth.login.title': 'Welcome Back',
    'auth.login.subtitleProvider': 'Log in to your provider account',
    'auth.login.subtitleClient': 'Log in to your client account',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.signUpNow': 'Sign up now',
    'auth.login.switchToProvider': 'Switch to Provider Login',
    'auth.login.switchToClient': 'Switch to Client Login',
    'auth.login.loggingIn': 'Logging in...',
    'auth.login.invalidCredentials': 'Invalid email or password. Please try again.',
    'auth.signup.client.title': 'Sign up as a Client',
    'auth.signup.client.subtitle': 'Find reliable service providers for your needs',
    'auth.signup.provider.title': 'Sign up as a Provider',
    'auth.signup.provider.subtitle': 'Start earning money by providing valuable services',
    'auth.signup.creatingAccount': 'Creating account...',
    'auth.signup.createAccount': 'Create Account',
    'auth.signup.ageTooYoung': 'You must be at least 18 years old to create an account.',
    'auth.signup.passwordsDoNotMatch': 'Passwords do not match.',
    'auth.signup.minAgeNote': 'You must be at least 18 years old to create an account',

    'onboarding.welcome.title': 'Welcome to',
    'onboarding.welcome.subtitle': 'Fast & reliable help. Anytime.',
    'onboarding.welcome.footer': 'Find services. Get things done.',
    'onboarding.common.skip': 'Skip',
    'onboarding.common.next': 'Next',
    'onboarding.common.getStarted': 'Get Started',
    'onboarding.common.termsNotice': 'By continuing, you agree to our Terms & Privacy Policy.',
    'onboarding.common.step3.title': "You’re\nready to go.",
    'onboarding.common.step3.subtitle': 'Join the Workly community.',
    'onboarding.common.agree.prefix': 'I agree to the',
    'onboarding.common.agree.terms': 'Terms of Service',
    'onboarding.common.agree.and': 'and',
    'onboarding.common.agree.privacy': 'Privacy Policy',
    'onboarding.common.agree.required': 'Please accept the Terms and Privacy Policy to continue.',
    'onboarding.client.step2.title': "Need help?\nWe’ve got you.",
    'onboarding.client.step2.bullet1': 'Choose a service',
    'onboarding.client.step2.bullet2': 'Get matched fast',
    'onboarding.client.step2.bullet3': 'Job done reliably',
    'onboarding.provider.step2.title': "Earn by\nhelping others.",
    'onboarding.provider.step2.bullet1': 'Pick jobs near you',
    'onboarding.provider.step2.bullet2': 'Complete tasks',
    'onboarding.provider.step2.bullet3': 'Grow your reputation',

    'providerProfilePage.title': 'My Profile',
    'providerProfilePage.profileLabel': 'Profile',
    'providerProfilePage.memberSince': 'Member since',
    'providerProfilePage.topline': 'Service provider • {count} tasks completed',
    'providerProfilePage.actions.done': 'Done',
    'providerProfilePage.actions.openSettings': 'Open settings',
    'providerProfilePage.actions.changePhoto': 'Change Photo',
    'providerProfilePage.actions.choose': 'Choose',
    'providerProfilePage.sections.details': 'Details',
    'providerProfilePage.sections.about': 'About',
    'providerProfilePage.sections.preferences': 'Preferences',
    'providerProfilePage.fields.fullName': 'Full Name',
    'providerProfilePage.fields.email': 'Email',
    'providerProfilePage.fields.telephoneOptional': 'Telephone (optional)',
    'providerProfilePage.fields.telephonePlaceholder': 'Add your phone number for easier contact',
    'providerProfilePage.fields.notProvided': 'Not provided',
    'providerProfilePage.fields.bio': 'Bio',
    'providerProfilePage.fields.bioPlaceholder': 'Tell clients about your experience and skills...',
    'providerProfilePage.fields.bioNotProvided': 'No bio provided',
    'providerProfilePage.fields.charactersRemaining': '{count} characters remaining',
    'providerProfilePage.fields.categoriesYouCanDo': 'Categories you can do',
    'providerProfilePage.level.new': 'New',
    'providerProfilePage.level.verified': 'Verified',
    'providerProfilePage.level.trusted': 'Trusted',
    'providerProfilePage.level.expert': 'Expert',
    'providerProfilePage.level.shortLabel': 'Lv {level}',
    'providerProfilePage.level.lineWithNext': 'Level {level}: {label} ({completed} / {next} jobs completed)',
    'providerProfilePage.level.lineMax': 'Level {level}: {label} ({completed} jobs completed)',
    'providerProfilePage.level.reachNext': 'Complete {remaining} more jobs to reach Level {nextLevel}.',
    'providerProfilePage.level.topLevel': "You've reached the top level — great work!",
    'providerProfilePage.stats.averageRating': 'Average Rating',
    'providerProfilePage.stats.tasksCompleted': 'Tasks Completed',
    'providerProfilePage.stats.totalEarnings': 'Total Earnings',
    'providerProfilePage.reviews.title': 'Reviews',
    'providerProfilePage.reviews.sortLabel': 'Sort:',
    'providerProfilePage.reviews.sort.newest': 'Newest',
    'providerProfilePage.reviews.sort.highest': 'Highest',
    'providerProfilePage.reviews.sort.lowest': 'Lowest',
    'providerProfilePage.reviews.empty': 'No reviews yet.',
    'providerProfilePage.reviews.anonymousClient': 'Anonymous Client',
    'providerProfilePage.alerts.avatarUploadFailed': 'Failed to upload profile picture: {message}',
    'providerProfilePage.alerts.saveFailed': 'Failed to save profile. Please try again.',

    'analytics.userNameFallback': 'Provider',
    'analytics.timeRange.last7Days': 'Last 7 days',
    'analytics.timeRange.thisMonth': 'This month',
    'analytics.timeRange.allTime': 'All time',
    'analytics.earnings.total': 'Total Earnings',
    'analytics.earnings.thisMonth': 'This Month',
    'analytics.earnings.last7Days': 'Last 7 Days',
    'analytics.cash.title': 'Add Cash Earning',
    'analytics.cash.amountLabel': 'Amount (€)',
    'analytics.cash.dateTimeLabel': 'Date & time',
    'analytics.cash.noteLabel': 'Note (optional)',
    'analytics.cash.amountPlaceholder': 'e.g. 25.00',
    'analytics.cash.notePlaceholder': 'e.g. Paid in cash on-site',
    'analytics.cash.addButton': 'Add',
    'analytics.cash.addFailed': 'Failed to add cash earning. Please try again.',
    'analytics.categories.title': 'Task Categories',
    'analytics.categories.empty': 'No completed jobs yet.',
    'analytics.categories.taskCount': '{count} tasks',
    'analytics.trust.title': 'Trust & Progress',
    'analytics.trust.unlockMessage': 'Complete {count} more tasks to unlock {reward}',
    'analytics.trust.badge1': '1-star frame',
    'analytics.trust.badge2': '2-star frame',
    'analytics.trust.badge3': '3-star frame',
    'analytics.trust.maxLevel': "Congratulations! You've reached the highest trust level! 🎉",
    'analytics.trust.currentLabel': 'Current: {count} tasks',
    'analytics.trust.nextLabel': 'Next: {count} tasks',
    'analytics.reviews.title': 'Ratings & Reviews',
    'analytics.reviews.empty': 'No reviews yet.',
    'analytics.reviews.anonymousClient': 'Anonymous Client',

    'settings.title': 'Settings',
    'settings.account': 'Account',
    'settings.account.editProfile': 'Edit profile',
    'settings.account.clientDesc': 'Change your name, photo and bio from your profile screen.',
    'settings.account.providerDesc': 'Update your profile details, bio and location from your profile screen.',
    'settings.notifications': 'Notifications',
    'settings.notifications.emailUpdates': 'Email updates about new messages',
    'settings.notifications.jobStatusUpdates': 'Notifications about job status changes',
    'settings.notifications.emailJobAlerts': 'Email alerts about new jobs',
    'settings.notifications.ratingUpdates': 'Updates about completed tasks and ratings',
    'settings.toggle.on': 'On',
    'settings.toggle.off': 'Off',
    'settings.legal': 'Legal',
    'settings.legal.terms': 'Terms of Service',
    'settings.legal.privacy': 'Privacy Policy',
    'settings.support': 'Support',
    'settings.language': 'Language',
    'settings.language.english': 'English',
    'settings.language.slovenian': 'Slovenian',
    'settings.support.cta': 'Having trouble or found a bug?',
    'settings.support.ctaProvider': 'Problems with clients, payments or your account?',
    'settings.support.email': 'Email support',

    'messages.byRequest.title': 'Messages by Request',
    'messages.byRequest.empty.title': 'No conversations yet',
    'messages.byRequest.empty.subtitle':
      'When providers contact you about your requests, the conversations will appear here.',
    'messages.byRequest.providersInterested': 'providers interested',
    'messages.byRequest.providersInterestedSingular': 'provider interested',
    'messages.job.back': '← Back to messages',
    'messages.job.conversationsTitle': 'Conversations',
    'messages.job.untitledJob': 'Untitled Job',
    'messages.job.providerFallback': 'Provider',
    'messages.job.empty.title': 'No conversations for this request yet.',
    'messages.job.empty.subtitle': 'When providers contact you, they will appear here.',
    'messages.job.providersMessaged': 'providers messaged about this request',
    'messages.job.providersMessagedSingular': 'provider messaged about this request',
    'messages.provider.title': 'My Conversations',
    'messages.provider.empty.title': 'No conversations yet',
    'messages.provider.empty.subtitle': 'When you contact a client about their job, the conversation will appear here.',

    'common.other': 'Other',
    'common.unknown': 'Unknown',
    'common.loadingUser': 'Loading...',

    'dashboard.greeting.hi': 'Hi',
    'dashboard.client.createRequest': 'Create request',
    'dashboard.stats.active': 'Active',
    'dashboard.stats.completed': 'Completed',
    'dashboard.stats.messages': 'Messages',
    'dashboard.client.myRequests': 'My Requests',
    'dashboard.client.noRequestsYet': "You haven't created any requests yet.",
    'dashboard.client.createFirstRequest': 'Create Your First Request',
    'dashboard.client.noActiveRequests': 'No active requests right now.',
    'dashboard.client.createNewRequest': 'Create a New Request',
    'dashboard.client.viewChats': 'View chats',
    'dashboard.client.recentUpdates': 'Recent Updates',
    'dashboard.client.noUpdatesYet': "No updates yet. You'll see activity here.",

    'activity.requestCreated': 'Created new request',
    'activity.assignedTo': 'Assigned to',
    'activity.completedBy': 'Completed by',
    'activity.reviewed': 'Reviewed',
    'activity.requestCancelled': 'Request cancelled',

    'report.submitted': 'Report submitted. Thank you!',
    'report.submitFailed': 'Failed to submit report. Please try again.',
    'report.title': 'Report issue',
    'report.subtitle': "Tell us what went wrong. We'll review it and take appropriate action.",
    'report.question': 'What happened?',
    'report.placeholder': 'Describe the issue...',
    'report.cancel': 'Cancel',
    'report.submitting': 'Submitting...',
    'report.submit': 'Submit report',

    'requests.title': 'My Requests',
    'requests.sortBy': 'Sort by:',
    'requests.sort.newest': 'Newest First',
    'requests.sort.oldest': 'Oldest First',
    'requests.filter.aria': 'Filter by status',
    'status.all': 'All',
    'status.open': 'Open',
    'status.completed': 'Completed',
    'status.cancelled': 'Cancelled',
    'requests.empty': 'No requests found for this status.',
    'requests.chat.view': 'View chats',
    'requests.edit.title': 'Edit Request',
    'requests.edit.submit': 'Update Request',
    'requests.updateFailed': 'Failed to update request. Please try again.',
    'requests.cancelConfirm': 'Cancel this request?',
    'requests.cancelFailed': 'Failed to cancel request. Please try again.',

    'dashboard.stats.rating': 'Rating',
    'dashboard.stats.earnings': 'Earnings',
    'provider.location.nearYou': 'Showing tasks near your location',
    'provider.location.getting': 'Getting your location...',
    'provider.filters.category': 'Category',
    'provider.filters.allCategories': 'All categories',
    'provider.filters.maxDistance': 'Max Distance',
    'provider.filters.anyDistance': 'Any distance',
    'provider.filters.sortBy': 'Sort by',
    'provider.filters.sort.mostRecent': 'Most Recent',
    'provider.filters.sort.highestPrice': 'Highest Price',
    'provider.filters.sort.nearest': 'Nearest',
    'provider.availableRequests': 'Available Requests',
    'provider.contactClient': 'Contact Client',
    'provider.noAvailableRequests': 'No available requests found.',
    'provider.tryAdjustingFilters': 'Try adjusting your filters.',
    'provider.checkBackLater': 'Check back later for new requests!',
    'provider.startChatFailed': 'Failed to start chat. Please try again.',

    'category.homeMaintenance': 'Home Maintenance & Repair',
    'category.outdoorGarden': 'Outdoor & Garden Work',
    'category.movingTransport': 'Moving & Transport',
    'category.cleaningMaintenance': 'Cleaning & Maintenance',
    'category.constructionRenovation': 'Construction & Renovation',
    'category.technicalInstallation': 'Technical & Installation',
    'category.vehicleServices': 'Vehicle Services',
    'category.personalAssistance': 'Personal Assistance',
    'category.seasonalMisc': 'Seasonal & Miscellaneous',
    'common.client': 'Client',

    'newRequest.title': 'Create New Request',
    'newRequest.subtitle': 'Fill out the form below to create a new service request.',
    'newRequest.error.loginRequired': 'You must be logged in to create a request',
    'newRequest.error.submitFailed': 'Failed to create request. Please try again.',

    'form.request.titleLabel': 'Title',
    'form.request.titlePlaceholder': 'e.g., Need help moving furniture',
    'form.request.categoryLabel': 'Category',
    'form.request.descriptionLabel': 'Description',
    'form.request.descriptionPlaceholder': 'Describe what you need help with...',
    'form.request.locationError': 'Please select a location on the map',
    'form.request.priceLabel': 'Price',
    'form.request.negotiableLabel': 'Negotiable',
    'form.request.photosLabel': 'Photos',
    'form.request.photosAdd': 'Add photos',
    'form.request.photosRemove': 'Remove image',
    'form.request.submitCreate': 'Create Request',

    'task.viewDescription': 'View description',
    'task.hideDescription': 'Hide description',

    'common.completedRequestsSingular': 'completed request',
    'common.completedRequestsPlural': 'completed requests',

    'providerProfile.title': 'Provider profile',
    'providerProfile.jobsDoneSingular': 'job done',
    'providerProfile.jobsDonePlural': 'jobs done',
    'providerProfile.reportButton': 'Report Provider',
    'providerProfile.reviewsTitle': 'Reviews',
    'providerProfile.noReviews': 'No reviews yet.',
    'providerProfile.reportModal.title': 'Report Provider',
    'providerProfile.reportModal.subtitlePrefix': 'Please provide a reason for reporting',
    'providerProfile.reportModal.reasonLabel': 'Reason for reporting',
    'providerProfile.reportModal.placeholder': 'Describe the issue or concern...',
    'providerProfile.reportModal.cancel': 'Cancel',
    'providerProfile.reportModal.submit': 'Submit report',
    'providerProfile.reportAlerts.missingReason': 'Please provide a reason for reporting.',
    'providerProfile.reportAlerts.submitted': 'Report submitted successfully. Thank you for helping keep our community safe.',
    'providerProfile.reportAlerts.failed': 'Failed to submit report. Please try again.',

    'chat.openTask': 'Open task',
    'chat.completedTask': 'Completed task',
    'chat.markAsCompleted': 'Mark as completed',

    'jobDetail.photos': 'Photos',
    'jobDetail.noPhotos': 'No photos',
    'jobDetail.openPhoto': 'Open photo',
    'jobDetail.closePhoto': 'Close photo',
    'jobDetail.completedRequestsLabel': 'Completed requests',
    'jobDetail.chatNow': 'Chat Now',
    'jobDetail.locationApproxArea': 'Approximate area',
    'jobDetail.locationApproxNotAvailable': 'Approximate location not available',

    'location.loadingMap': 'Loading map...',
    'location.approxAreaSuffix': '(~1km area)',
    'location.approximateLabel': 'Approximate location (~1km radius)',

    'task.viewMore': 'View more',

    'common.loading': 'Loading…',
  },
  sl: {
    'nav.dashboard': 'Nadzorna plošča',
    'nav.myRequests': 'Moja naročila',
    'nav.messages': 'Sporočila',
    'nav.analytics': 'Analitika',
    'nav.profile': 'Profil',

    'home.welcomeTo': 'Dobrodošli v',
    'home.subtitle': 'Povežite se z zanesljivimi ponudniki storitev ali zaslužite s pomočjo drugim',
    'home.providerCard.title': 'Želim ponuditi pomoč',
    'home.providerCard.subtitle': 'Začnite služiti z opravljanjem storitev ljudem v vaši bližini.',
    'home.providerCard.signup': 'Registracija kot ponudnik',
    'home.providerCard.login': 'Prijava kot ponudnik',
    'home.clientCard.title': 'Potrebujem pomoč pri nečem',
    'home.clientCard.subtitle': 'Najdite zanesljivo pomoč za svoje naloge in jih opravite hitro.',
    'home.clientCard.signup': 'Registracija kot stranka',
    'home.clientCard.login': 'Prijava kot stranka',

    'auth.common.or': 'Ali',
    'auth.common.choose': 'Izberi',
    'auth.common.login': 'Prijava',
    'auth.common.alreadyHaveAccount': 'Že imate račun?',
    'auth.common.backToHome': '← Nazaj domov',
    'auth.common.genericError': 'Nekaj je šlo narobe. Poskusite znova.',
    'auth.form.fullName': 'Polno ime',
    'auth.form.email': 'E‑pošta',
    'auth.form.emailPlaceholder': 'vi@primer.si',
    'auth.form.dateOfBirth': 'Datum rojstva',
    'auth.form.dateOfBirthRequired': 'Datum rojstva je obvezen.',
    'auth.form.telephoneOptional': 'Telefon (neobvezno)',
    'auth.form.telephonePlaceholder': 'Dodajte telefonsko številko za lažji stik',
    'auth.form.password': 'Geslo',
    'auth.form.confirmPassword': 'Ponovi geslo',
    'auth.form.passwordMinHint': 'Mora imeti vsaj 8 znakov',
    'auth.form.categoriesYouCanDo': 'Kategorije, ki jih lahko opravljate',
    'auth.form.categoriesHelp': 'Izberite vrste del. To lahko kasneje spremenite v profilu.',
    'auth.login.title': 'Dobrodošli nazaj',
    'auth.login.subtitleProvider': 'Prijavite se v račun ponudnika',
    'auth.login.subtitleClient': 'Prijavite se v račun stranke',
    'auth.login.noAccount': 'Nimate računa?',
    'auth.login.signUpNow': 'Registrirajte se',
    'auth.login.switchToProvider': 'Preklopi na prijavo ponudnika',
    'auth.login.switchToClient': 'Preklopi na prijavo stranke',
    'auth.login.loggingIn': 'Prijavljam ...',
    'auth.login.invalidCredentials': 'Napačen e‑poštni naslov ali geslo. Poskusite znova.',
    'auth.signup.client.title': 'Registracija kot stranka',
    'auth.signup.client.subtitle': 'Najdite zanesljive ponudnike storitev za svoje potrebe',
    'auth.signup.provider.title': 'Registracija kot ponudnik',
    'auth.signup.provider.subtitle': 'Začnite služiti z opravljanjem storitev',
    'auth.signup.creatingAccount': 'Ustvarjam račun ...',
    'auth.signup.createAccount': 'Ustvari račun',
    'auth.signup.ageTooYoung': 'Za ustvarjanje računa morate biti stari vsaj 18 let.',
    'auth.signup.passwordsDoNotMatch': 'Gesli se ne ujemata.',
    'auth.signup.minAgeNote': 'Za ustvarjanje računa morate biti stari vsaj 18 let',

    'onboarding.welcome.title': 'Dobrodošli v',
    'onboarding.welcome.subtitle': 'Hitra in zanesljiva pomoč. Kadarkoli.',
    'onboarding.welcome.footer': 'Najdite storitve. Opravite delo.',
    'onboarding.common.skip': 'Preskoči',
    'onboarding.common.next': 'Naprej',
    'onboarding.common.getStarted': 'Začni',
    'onboarding.common.termsNotice': 'Z nadaljevanjem se strinjate s pogoji uporabe in pravilnikom o zasebnosti.',
    'onboarding.common.step3.title': 'Pripravljeni\nste za začetek.',
    'onboarding.common.step3.subtitle': 'Pridružite se skupnosti Workly.',
    'onboarding.common.agree.prefix': 'Strinjam se s',
    'onboarding.common.agree.terms': 'pogoji uporabe',
    'onboarding.common.agree.and': 'in',
    'onboarding.common.agree.privacy': 'pravilnikom o zasebnosti',
    'onboarding.common.agree.required': 'Za nadaljevanje morate potrditi pogoje uporabe in pravilnik o zasebnosti.',
    'onboarding.client.step2.title': 'Potrebujete pomoč?\nTu smo za vas.',
    'onboarding.client.step2.bullet1': 'Izberite storitev',
    'onboarding.client.step2.bullet2': 'Hitro dobite ponudnike',
    'onboarding.client.step2.bullet3': 'Delo opravljeno zanesljivo',
    'onboarding.provider.step2.title': 'Zaslužite\ns pomočjo drugim.',
    'onboarding.provider.step2.bullet1': 'Izberite dela v bližini',
    'onboarding.provider.step2.bullet2': 'Opravite naročila',
    'onboarding.provider.step2.bullet3': 'Zgradite ugled',

    'providerProfilePage.title': 'Moj profil',
    'providerProfilePage.profileLabel': 'Profil',
    'providerProfilePage.memberSince': 'Član od',
    'providerProfilePage.topline': 'Ponudnik storitev • {count} zaključenih naročil',
    'providerProfilePage.actions.done': 'Končano',
    'providerProfilePage.actions.openSettings': 'Odpri nastavitve',
    'providerProfilePage.actions.changePhoto': 'Spremeni fotografijo',
    'providerProfilePage.actions.choose': 'Izberi',
    'providerProfilePage.sections.details': 'Podrobnosti',
    'providerProfilePage.sections.about': 'O meni',
    'providerProfilePage.sections.preferences': 'Nastavitve',
    'providerProfilePage.fields.fullName': 'Polno ime',
    'providerProfilePage.fields.email': 'E‑pošta',
    'providerProfilePage.fields.telephoneOptional': 'Telefon (neobvezno)',
    'providerProfilePage.fields.telephonePlaceholder': 'Dodajte telefonsko številko za lažji stik',
    'providerProfilePage.fields.notProvided': 'Ni navedeno',
    'providerProfilePage.fields.bio': 'Opis',
    'providerProfilePage.fields.bioPlaceholder': 'Povejte strankam o svojih izkušnjah in znanju ...',
    'providerProfilePage.fields.bioNotProvided': 'Opis ni dodan',
    'providerProfilePage.fields.charactersRemaining': 'Preostalo znakov: {count}',
    'providerProfilePage.fields.categoriesYouCanDo': 'Kategorije, ki jih lahko opravljate',
    'providerProfilePage.level.new': 'Nov',
    'providerProfilePage.level.verified': 'Preverjen',
    'providerProfilePage.level.trusted': 'Zaupanja vreden',
    'providerProfilePage.level.expert': 'Strokovnjak',
    'providerProfilePage.level.shortLabel': 'Nivo {level}',
    'providerProfilePage.level.lineWithNext': 'Nivo {level}: {label} ({completed} / {next} zaključenih del)',
    'providerProfilePage.level.lineMax': 'Nivo {level}: {label} ({completed} zaključenih del)',
    'providerProfilePage.level.reachNext': 'Zaključite še {remaining} del do nivoja {nextLevel}.',
    'providerProfilePage.level.topLevel': 'Dosegli ste najvišji nivo — odlično!',
    'providerProfilePage.stats.averageRating': 'Povprečna ocena',
    'providerProfilePage.stats.tasksCompleted': 'Zaključena naročila',
    'providerProfilePage.stats.totalEarnings': 'Skupni zaslužek',
    'providerProfilePage.reviews.title': 'Ocene',
    'providerProfilePage.reviews.sortLabel': 'Razvrsti:',
    'providerProfilePage.reviews.sort.newest': 'Najnovejše',
    'providerProfilePage.reviews.sort.highest': 'Najvišje',
    'providerProfilePage.reviews.sort.lowest': 'Najnižje',
    'providerProfilePage.reviews.empty': 'Še ni ocen.',
    'providerProfilePage.reviews.anonymousClient': 'Anonimna stranka',
    'providerProfilePage.alerts.avatarUploadFailed': 'Nalaganje profilne slike ni uspelo: {message}',
    'providerProfilePage.alerts.saveFailed': 'Shranjevanje profila ni uspelo. Poskusite znova.',

    'analytics.userNameFallback': 'Ponudnik',
    'analytics.timeRange.last7Days': 'Zadnjih 7 dni',
    'analytics.timeRange.thisMonth': 'Ta mesec',
    'analytics.timeRange.allTime': 'Ves čas',
    'analytics.earnings.total': 'Skupni zaslužek',
    'analytics.earnings.thisMonth': 'Ta mesec',
    'analytics.earnings.last7Days': 'Zadnjih 7 dni',
    'analytics.cash.title': 'Dodaj zaslužek (gotovina)',
    'analytics.cash.amountLabel': 'Znesek (€)',
    'analytics.cash.dateTimeLabel': 'Datum in čas',
    'analytics.cash.noteLabel': 'Opomba (neobvezno)',
    'analytics.cash.amountPlaceholder': 'npr. 25.00',
    'analytics.cash.notePlaceholder': 'npr. Plačano v gotovini na lokaciji',
    'analytics.cash.addButton': 'Dodaj',
    'analytics.cash.addFailed': 'Zasluga ni bilo mogoče dodati. Poskusite znova.',
    'analytics.categories.title': 'Kategorije naročil',
    'analytics.categories.empty': 'Še ni zaključenih naročil.',
    'analytics.categories.taskCount': '{count} naročil',
    'analytics.trust.title': 'Zaupanje in napredek',
    'analytics.trust.unlockMessage': 'Zaključite še {count} naročil za odklep {reward}',
    'analytics.trust.badge1': 'okvir z 1 zvezdico',
    'analytics.trust.badge2': 'okvir z 2 zvezdicama',
    'analytics.trust.badge3': 'okvir s 3 zvezdicami',
    'analytics.trust.maxLevel': 'Čestitke! Dosegli ste najvišjo raven zaupanja! 🎉',
    'analytics.trust.currentLabel': 'Trenutno: {count} naročil',
    'analytics.trust.nextLabel': 'Naslednje: {count} naročil',
    'analytics.reviews.title': 'Ocene in mnenja',
    'analytics.reviews.empty': 'Še ni ocen.',
    'analytics.reviews.anonymousClient': 'Anonimna stranka',

    'settings.title': 'Nastavitve',
    'settings.account': 'Račun',
    'settings.account.editProfile': 'Uredi profil',
    'settings.account.clientDesc': 'Svoje ime, fotografijo in opis lahko spremenite v profilu.',
    'settings.account.providerDesc': 'Podatke profila, opis in lokacijo lahko posodobite v profilu.',
    'settings.notifications': 'Obvestila',
    'settings.notifications.emailUpdates': 'E‑poštna obvestila o novih sporočilih',
    'settings.notifications.jobStatusUpdates': 'Obvestila o spremembah statusa opravila',
    'settings.notifications.emailJobAlerts': 'E‑poštna obvestila o novih delih',
    'settings.notifications.ratingUpdates': 'Obvestila o zaključenih delih in ocenah',
    'settings.toggle.on': 'Vklop',
    'settings.toggle.off': 'Izklop',
    'settings.legal': 'Pravno',
    'settings.legal.terms': 'Pogoji uporabe',
    'settings.legal.privacy': 'Pravilnik o zasebnosti',
    'settings.support': 'Podpora',
    'settings.language': 'Jezik',
    'settings.language.english': 'Angleščina',
    'settings.language.slovenian': 'Slovenščina',
    'settings.support.cta': 'Imate težave ali ste našli napako?',
    'settings.support.ctaProvider': 'Težave s strankami, plačili ali računom?',
    'settings.support.email': 'Piši podpori',

    'messages.byRequest.title': 'Sporočila po naročilu',
    'messages.byRequest.empty.title': 'Še ni pogovorov',
    'messages.byRequest.empty.subtitle':
      'Ko vam ponudniki pišejo glede vaših naročil, se bodo pogovori prikazali tukaj.',
    'messages.byRequest.providersInterested': 'ponudnikov zainteresiranih',
    'messages.byRequest.providersInterestedSingular': 'ponudnik zainteresiran',
    'messages.job.back': '← Nazaj na sporočila',
    'messages.job.conversationsTitle': 'Pogovori',
    'messages.job.untitledJob': 'Nenaslovljeno naročilo',
    'messages.job.providerFallback': 'Ponudnik',
    'messages.job.empty.title': 'Za to naročilo še ni pogovorov.',
    'messages.job.empty.subtitle': 'Ko vas ponudniki kontaktirajo, se bodo prikazali tukaj.',
    'messages.job.providersMessaged': 'ponudnikov je pisalo glede tega naročila',
    'messages.job.providersMessagedSingular': 'ponudnik je pisal glede tega naročila',
    'messages.provider.title': 'Moji pogovori',
    'messages.provider.empty.title': 'Še ni pogovorov',
    'messages.provider.empty.subtitle': 'Ko kontaktirate stranko glede njenega opravila, se bo pogovor prikazal tukaj.',

    'common.other': 'Drugo',
    'common.unknown': 'Neznano',
    'common.loadingUser': 'Nalaganje...',

    'dashboard.greeting.hi': 'Živjo',
    'dashboard.client.createRequest': 'Ustvari naročilo',
    'dashboard.stats.active': 'Aktivno',
    'dashboard.stats.completed': 'Zaključeno',
    'dashboard.stats.messages': 'Sporočila',
    'dashboard.client.myRequests': 'Moja naročila',
    'dashboard.client.noRequestsYet': 'Še niste ustvarili nobenega naročila.',
    'dashboard.client.createFirstRequest': 'Ustvari prvo naročilo',
    'dashboard.client.noActiveRequests': 'Trenutno ni aktivnih naročil.',
    'dashboard.client.createNewRequest': 'Ustvari novo naročilo',
    'dashboard.client.viewChats': 'Poglej klepete',
    'dashboard.client.recentUpdates': 'Nedavne posodobitve',
    'dashboard.client.noUpdatesYet': 'Še ni posodobitev. Aktivnost se bo prikazala tukaj.',

    'activity.requestCreated': 'Ustvarjeno novo naročilo',
    'activity.assignedTo': 'Dodeljeno',
    'activity.completedBy': 'Zaključil',
    'activity.reviewed': 'Ocenil',
    'activity.requestCancelled': 'Zahtevek preklican',

    'report.submitted': 'Prijava poslana. Hvala!',
    'report.submitFailed': 'Prijave ni bilo mogoče poslati. Poskusite znova.',
    'report.title': 'Prijavi težavo',
    'report.subtitle': 'Povejte, kaj je šlo narobe. Pregledali bomo in ustrezno ukrepali.',
    'report.question': 'Kaj se je zgodilo?',
    'report.placeholder': 'Opišite težavo ...',
    'report.cancel': 'Prekliči',
    'report.submitting': 'Pošiljanje ...',
    'report.submit': 'Pošlji prijavo',

    'requests.title': 'Moja naročila',
    'requests.sortBy': 'Razvrsti po:',
    'requests.sort.newest': 'Najnovejše najprej',
    'requests.sort.oldest': 'Najstarejše najprej',
    'requests.filter.aria': 'Filtriraj po statusu',
    'status.all': 'Vse',
    'status.open': 'Odprto',
    'status.completed': 'Zaključeno',
    'status.cancelled': 'Preklicano',
    'requests.empty': 'Za izbrani status ni najdenih naročil.',
    'requests.chat.view': 'Poglej klepete',
    'requests.edit.title': 'Uredi naročilo',
    'requests.edit.submit': 'Posodobi naročilo',
    'requests.updateFailed': 'Naročila ni bilo mogoče posodobiti. Poskusite znova.',
    'requests.cancelConfirm': 'Prekličem to naročilo?',
    'requests.cancelFailed': 'Naročila ni bilo mogoče preklicati. Poskusite znova.',

    'dashboard.stats.rating': 'Ocena',
    'dashboard.stats.earnings': 'Zaslužek',
    'provider.location.nearYou': 'Prikazujem opravila v bližini vaše lokacije',
    'provider.location.getting': 'Pridobivam vašo lokacijo ...',
    'provider.filters.category': 'Kategorija',
    'provider.filters.allCategories': 'Vse kategorije',
    'provider.filters.maxDistance': 'Največja razdalja',
    'provider.filters.anyDistance': 'Poljubna razdalja',
    'provider.filters.sortBy': 'Razvrsti po',
    'provider.filters.sort.mostRecent': 'Najnovejše',
    'provider.filters.sort.highestPrice': 'Najvišja cena',
    'provider.filters.sort.nearest': 'Najbližje',
    'provider.availableRequests': 'Razpoložljiva naročila',
    'provider.contactClient': 'Kontaktiraj stranko',
    'provider.noAvailableRequests': 'Ni razpoložljivih naročil.',
    'provider.tryAdjustingFilters': 'Poskusite prilagoditi filtre.',
    'provider.checkBackLater': 'Kasneje preverite za nova naročila!',
    'provider.startChatFailed': 'Klepeta ni bilo mogoče začeti. Poskusite znova.',

    'category.homeMaintenance': 'Vzdrževanje doma in popravila',
    'category.outdoorGarden': 'Delo na vrtu in zunaj',
    'category.movingTransport': 'Selitve in prevoz',
    'category.cleaningMaintenance': 'Čiščenje in vzdrževanje',
    'category.constructionRenovation': 'Gradnja in prenova',
    'category.technicalInstallation': 'Tehnika in montaža',
    'category.vehicleServices': 'Storitve za vozila',
    'category.personalAssistance': 'Osebna pomoč',
    'category.seasonalMisc': 'Sezonsko in drugo',
    'common.client': 'Stranka',

    'newRequest.title': 'Ustvari novo naročilo',
    'newRequest.subtitle': 'Izpolnite spodnji obrazec za ustvarjanje novega naročila.',
    'newRequest.error.loginRequired': 'Za ustvarjanje naročila morate biti prijavljeni',
    'newRequest.error.submitFailed': 'Naročila ni bilo mogoče ustvariti. Poskusite znova.',

    'form.request.titleLabel': 'Naslov',
    'form.request.titlePlaceholder': 'npr. Potrebujem pomoč pri selitvi pohištva',
    'form.request.categoryLabel': 'Kategorija',
    'form.request.descriptionLabel': 'Opis',
    'form.request.descriptionPlaceholder': 'Opišite, pri čem potrebujete pomoč ...',
    'form.request.locationError': 'Prosimo izberite lokacijo na zemljevidu',
    'form.request.priceLabel': 'Cena',
    'form.request.negotiableLabel': 'Po dogovoru',
    'form.request.photosLabel': 'Fotografije',
    'form.request.photosAdd': 'Dodaj fotografije',
    'form.request.photosRemove': 'Odstrani sliko',
    'form.request.submitCreate': 'Ustvari naročilo',

    'task.viewDescription': 'Poglej opis',
    'task.hideDescription': 'Skrij opis',

    'common.completedRequestsSingular': 'zaključeno naročilo',
    'common.completedRequestsPlural': 'zaključena naročila',

    'providerProfile.title': 'Profil ponudnika',
    'providerProfile.jobsDoneSingular': 'zaključeno delo',
    'providerProfile.jobsDonePlural': 'zaključenih del',
    'providerProfile.reportButton': 'Prijavi ponudnika',
    'providerProfile.reviewsTitle': 'Ocene',
    'providerProfile.noReviews': 'Še ni ocen.',
    'providerProfile.reportModal.title': 'Prijavi ponudnika',
    'providerProfile.reportModal.subtitlePrefix': 'Prosimo navedite razlog za prijavo',
    'providerProfile.reportModal.reasonLabel': 'Razlog prijave',
    'providerProfile.reportModal.placeholder': 'Opišite težavo ali skrb ...',
    'providerProfile.reportModal.cancel': 'Prekliči',
    'providerProfile.reportModal.submit': 'Pošlji prijavo',
    'providerProfile.reportAlerts.missingReason': 'Prosimo navedite razlog za prijavo.',
    'providerProfile.reportAlerts.submitted': 'Prijava uspešno poslana. Hvala, ker pomagate ohranjati skupnost varno.',
    'providerProfile.reportAlerts.failed': 'Prijave ni bilo mogoče poslati. Poskusite znova.',

    'chat.openTask': 'Odpri naročilo',
    'chat.completedTask': 'Zaključeno naročilo',
    'chat.markAsCompleted': 'Označi kot zaključeno',

    'jobDetail.photos': 'Fotografije',
    'jobDetail.noPhotos': 'Ni fotografij',
    'jobDetail.openPhoto': 'Odpri fotografijo',
    'jobDetail.closePhoto': 'Zapri fotografijo',
    'jobDetail.completedRequestsLabel': 'Zaključena naročila',
    'jobDetail.chatNow': 'Klepetaj',
    'jobDetail.locationApproxArea': 'Približno območje',
    'jobDetail.locationApproxNotAvailable': 'Približna lokacija ni na voljo',

    'location.loadingMap': 'Nalaganje zemljevida ...',
    'location.approxAreaSuffix': '(~1 km območje)',
    'location.approximateLabel': 'Približna lokacija (~1 km radius)',

    'task.viewMore': 'Poglej več',

    'common.loading': 'Nalaganje…',
  },
};


