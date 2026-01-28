export const PROJECTS = [
	{
		slug: "watchers",
		title: "The Watchers",
		description:
			"A modern myth where ancient powers hide in plain sight, and the cost of progress is finally collected.",
		heroImage: "/images/pompeii.jpg",
	},
	{
		slug: "saffrondale",
		title: "Saffrondale",
		description:
			"A canonical, player-facing world with maps, locations, and rules that stay consistent across sessions.",
		heroImage: "/images/MapOfSaffrondale.jpg",
	},
	{
		slug: "ai-podcasts",
		title: "AI Podcasts",
		description:
			"Notebook-style briefings on science, finance, and emerging ideas with structured signal.",
		heroImage: "/images/the_cross_keys.jpg",
	},
] as const;

export const PROJECTS_BY_SLUG = Object.fromEntries(
	PROJECTS.map((project) => [project.slug, project]),
);
