<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>T-Gram - Gamified Learning Platform</title>
    <meta name="description" content="A gamified learning platform for rural education with interactive modules for Algebra and Biology">
    <meta name="theme-color" content="#008080">
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="T-Gram">
    
    <!-- Icons -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
    <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png">
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#008080',
                        secondary: '#FF7F50',
                        accent: '#9370DB',
                        success: '#10B981',
                        warning: '#F59E0B',
                        error: '#EF4444'
                    },
                    animation: {
                        'bounce-slow': 'bounce 2s infinite',
                        'pulse-slow': 'pulse 3s infinite',
                        'spin-slow': 'spin 4s linear infinite'
                    }
                }
            }
        }
    </script>
    
    <!-- Styles -->
    <link rel="stylesheet" href="/public/css/style.css">
    
    <!-- Service Worker -->
    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('SW registered'))
                    .catch(error => console.log('SW registration failed'));
            });
        }
    </script>
</head>
<body class="bg-gradient-to-br from-primary via-secondary to-accent min-h-screen text-gray-800 font-poppins">
    <!-- Navigation -->
    <nav class="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                        <i class="fas fa-graduation-cap text-white text-sm"></i>
                    </div>
                    <span class="font-bold text-xl text-primary">T-Gram</span>
                </div>
                
                <div class="hidden md:flex items-center space-x-6">
                    <div class="relative group">
                        <button onclick="toggleDropdown()" class="text-gray-600 hover:text-primary transition-colors flex items-center">
                            Home <i class="fas fa-chevron-down ml-1 text-xs"></i>
                        </button>
                        <div id="home-dropdown" class="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-50">
                            <a href="#" onclick="renderHome()" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-primary">Home</a>
                            <a href="#" onclick="renderAbout()" class="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-primary">About Us</a>
                        </div>
                    </div>
                    <a href="#" onclick="renderLeaderboard()" class="text-gray-600 hover:text-primary transition-colors">Leaderboard</a>
                    <a href="#" onclick="renderProfile()" class="text-gray-600 hover:text-primary transition-colors">Profile</a>
                    <button onclick="toggleLanguage()" class="bg-primary text-white px-3 py-1 rounded-full text-sm hover:bg-primary/80 transition-colors">
                        <i class="fas fa-globe mr-1"></i><span id="lang-text">EN</span>
                    </button>
                    <button onclick="toggleTheme()" class="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-gray-300 transition-colors">
                        <i class="fas fa-moon" id="theme-icon"></i>
                    </button>
                </div>
                
                <div class="md:hidden">
                    <button onclick="toggleMobileMenu()" class="text-gray-600 hover:text-primary">
                        <i class="fas fa-bars text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
            <div class="px-4 pt-2 pb-3 space-y-1">
                <div class="relative">
                    <button onclick="toggleMobileDropdown()" class="w-full text-left px-3 py-2 text-gray-600 hover:text-primary flex items-center justify-between">
                        Home <i class="fas fa-chevron-down text-xs"></i>
                    </button>
                    <div id="mobile-home-dropdown" class="hidden bg-gray-100 px-3 py-2 space-y-1">
                        <a href="#" onclick="renderHome()" class="block px-3 py-2 text-gray-600 hover:text-primary">Home</a>
                        <a href="#" onclick="renderAbout()" class="block px-3 py-2 text-gray-600 hover:text-primary">About Us</a>
                    </div>
                </div>
                <a href="#" onclick="renderLeaderboard()" class="block px-3 py-2 text-gray-600 hover:text-primary">Leaderboard</a>
                <a href="#" onclick="renderProfile()" class="block px-3 py-2 text-gray-600 hover:text-primary">Profile</a>
                <div class="flex justify-between px-3 py-2">
                    <button onclick="toggleLanguage()" class="bg-primary text-white px-3 py-1 rounded-full text-sm">
                        <i class="fas fa-globe mr-1"></i><span id="lang-text-mobile">EN</span>
                    </button>
                    <button onclick="toggleTheme()" class="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">
                        <i class="fas fa-moon" id="theme-icon-mobile"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Main Content -->
    <main id="app" class="min-h-screen">
