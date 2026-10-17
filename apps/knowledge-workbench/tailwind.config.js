import tailwindcssAnimate from "tailwindcss-animate"

export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
		colors: {
			background: '#0a0a0f',
			foreground: '#f5f0e8',
			surface: '#0d1526',
			'surface-low': '#111a2e',
			'surface-container': '#16223a',
			'surface-high': '#1c2b45',
			'surface-highest': '#22304b',
			card: '#111a2e',
			'card-foreground': '#f5f0e8',
			popover: '#16223a',
			'popover-foreground': '#f5f0e8',
			primary: '#d4a574',
			'primary-dim': '#e6a85c',
			'primary-on': '#0a0a0f',
			'primary-foreground': '#0a0a0f',
			secondary: '#e6a85c',
			'secondary-dim': '#d4a574',
			'secondary-on': '#0a0a0f',
			'secondary-foreground': '#0a0a0f',
			muted: '#111a2e',
			'muted-foreground': 'rgba(245,240,232,0.55)',
			accent: '#16223a',
			'accent-foreground': '#f5f0e8',
			error: '#e06c5a',
			'error-container': '#93000a',
			destructive: '#93000a',
			'destructive-foreground': '#ffb4ab',
			outline: 'rgba(245,240,232,0.14)',
			'outline-variant': 'rgba(212,165,116,0.18)',
			'on-surface': '#f5f0e8',
			'on-muted': '#b5afa6',
			border: 'rgba(212,165,116,0.18)',
			input: 'rgba(245,240,232,0.14)',
			ring: '#d4a574',
			family: {
				self: '#7cba7c',
				domain: '#7fb3d5',
				conversation: '#e6a85c',
				user: '#c97db9',
				none: '#9aa7bd'
			}
		},
  		fontFamily: {
  			headline: [
  				'Inter',
  				'sans-serif'
  			],
  			body: [
  				'Inter',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'monospace'
  			]
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
}
