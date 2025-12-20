## Packages
framer-motion | Complex animations for page transitions and UI elements
recharts | Admin dashboard analytics
lucide-react | Icons for the interface (already in base but explicit is good)
react-hook-form | Form handling
zod | Schema validation
@hookform/resolvers | Zod resolver for react-hook-form

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}
API uses credentials: "include" for all requests.
Images are simulated or use Unsplash URLs.
