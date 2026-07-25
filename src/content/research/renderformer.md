---
title: "RenderFormer with Linear Attention"
date: 2025-01-01
excerpt: "Bringing a transformer-based rendering pipeline (Microsoft's RenderFormer) from O(N²) to linear time complexity via Performer (FAVOR++) attention."
image: "/images/research/project-renderformer.png"
featured: true
links:
  - { label: "GitHub", href: "https://github.com/kyaw-yethu/renderformer" }
  - { label: "Slides", href: "https://docs.google.com/presentation/d/1I7wcdrXZ9zz2HwnHLaQPYCvSGV0oPWOd7iFZ3wE5N0w/edit" }
---

RenderFormer is an end-to-end, fully data-driven transformer-based rendering pipeline developed by Microsoft. Because it relies on vanilla transformer attention, it has O(N²) time complexity. This project explores achieving linear time complexity by replacing vanilla attention with a linear attention mechanism, Performer (FAVOR++).
