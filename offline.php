<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - T-Gram</title>
    <style>
        body {
            font-family: 'Poppins', Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #008080, #FF7F50, #9370DB);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .offline-icon {
            font-size: 100px;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 20px;
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 30px;
        }
        button {
            background: #FF7F50;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 1rem;
            border-radius: 25px;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #E55A3A;
        }
        @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
                transform: translate3d(0,0,0);
            }
            40%, 43% {
                transform: translate3d(0, -30px, 0);
            }
            70% {
                transform: translate3d(0, -15px, 0);
            }
            90% {
                transform: translate3d(0, -4px, 0);
            }
        }
    </style>
</head>
<body>
    <div class="offline-icon">📱</div>
    <h1>You're Offline</h1>
    <p>Please check your internet connection and try again.</p>
    <button onclick="location.reload()">Retry Connection</button>
    <p style="margin-top: 30px; font-size: 0.9rem;">T-Gram will work offline once loaded</p>
</body>
</html>
