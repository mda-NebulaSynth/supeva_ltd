# Animation System Documentation

## Overview

The Supeva Sandbox project uses a high-performance animation system built with **Framer Motion** and **Anime.js** to deliver smooth, engaging user experiences at 60+ FPS.

## Technologies

- **Framer Motion**: Primary animation library for React components with scroll-triggered reveals
- **Anime.js**: Complex sequenced animations and timeline-based effects
- **Custom Hooks**: Performance-optimized hooks for scroll detection and parallax effects

## Performance Optimization

All animations are optimized for 60+ FPS by:
- Using `transform` and `opacity` only (GPU-accelerated properties)
- Implementing `will-change` CSS property strategically
- Using `IntersectionObserver` for scroll triggers instead of scroll listeners
- Respecting `prefers-reduced-motion` media query

## Animation Utilities

### Location: `src/utils/animations.ts`

#### Fade Animations
```tsx
import { fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight } from '../utils/animations';

<motion.div variants={fadeInUp}>Content</motion.div>
```

#### Scale Animations
```tsx
import { scaleIn, scaleInUp } from '../utils/animations';

<motion.div variants={scaleIn}>Content</motion.div>
```

#### Stagger Animations
```tsx
import { staggerContainer, staggerItem } from '../utils/animations';

<motion.div variants={staggerContainer}>
  <motion.div variants={staggerItem}>Item 1</motion.div>
  <motion.div variants={staggerItem}>Item 2</motion.div>
</motion.div>
```

#### Hover & Interaction Animations
```tsx
import { hoverScale, hoverLift, tapScale } from '../utils/animations';

<motion.button whileHover={hoverScale} whileTap={tapScale}>
  Click Me
</motion.button>
```

## Animated Components

### Location: `src/components/animated/`

#### AnimatedSection
Scroll-triggered section reveals:
```tsx
import { AnimatedSection } from '../components/animated';
import { fadeInUp } from '../utils/animations';

<AnimatedSection variants={fadeInUp} delay={0.2}>
  <h2>Section Title</h2>
  <p>Content</p>
</AnimatedSection>
```

#### AnimatedCard
Card with hover effects:
```tsx
import { AnimatedCard } from '../components/animated';

<AnimatedCard delay={0.1} enableHover={true}>
  <div className="card">Card Content</div>
</AnimatedCard>
```

#### StaggeredList & StaggeredItem
Sequential item animations:
```tsx
import { StaggeredList, StaggeredItem } from '../components/animated';

<StaggeredList staggerDelay={0.1}>
  {items.map(item => (
    <StaggeredItem key={item.id}>
      <Card {...item} />
    </StaggeredItem>
  ))}
</StaggeredList>
```

## Custom Hooks

### Location: `src/hooks/useScrollAnimation.ts`

#### useScrollAnimation
Trigger animations on scroll:
```tsx
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const { ref, isVisible } = useScrollAnimation({
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px',
  triggerOnce: true
});

<div ref={ref}>
  {isVisible && <AnimatedContent />}
</div>
```

#### useInView
Detect if element is in viewport:
```tsx
import { useInView } from '../hooks/useScrollAnimation';

const { ref, inView } = useInView({ threshold: 0.5 });

<div ref={ref} className={inView ? 'visible' : 'hidden'}>
  Content
</div>
```

#### useParallax
Create parallax scroll effects:
```tsx
import { useParallax } from '../hooks/useScrollAnimation';

const { ref, offset } = useParallax(0.5);

<div ref={ref} style={{ transform: `translateY(${offset}px)` }}>
  Parallax Content
</div>
```

## Anime.js Integration

### Counter Animations
```tsx
import anime from 'animejs';

useEffect(() => {
  anime({
    targets: '.stat-number',
    innerHTML: [0, 100],
    duration: 2000,
    round: 1,
    easing: 'easeOutExpo'
  });
}, []);
```

### Complex Sequences
```tsx
import anime from 'animejs';

const timeline = anime.timeline({
  easing: 'easeOutExpo',
  duration: 750
});

timeline
  .add({ targets: '.hero-title', opacity: [0, 1], translateY: [40, 0] })
  .add({ targets: '.hero-subtitle', opacity: [0, 1], translateY: [20, 0] }, '-=500')
  .add({ targets: '.hero-cta', opacity: [0, 1], scale: [0.8, 1] }, '-=500');
```

## Accessibility

### Reduced Motion Support

All animations respect the `prefers-reduced-motion` media query:

```tsx
import { getAnimationVariants, prefersReducedMotion } from '../utils/animations';

// Automatically applies reduced motion variants
const variants = getAnimationVariants(fadeInUp);

<motion.div variants={variants}>Content</motion.div>
```

Manual check:
```tsx
if (prefersReducedMotion()) {
  // Skip complex animations
} else {
  // Apply full animations
}
```

### Keyboard Navigation

All interactive animated elements maintain keyboard accessibility:
- Focus states are preserved
- Tab order is maintained
- ARIA labels are included where needed

## Best Practices

### 1. Use GPU-Accelerated Properties
```tsx
// ✅ Good - GPU accelerated
<motion.div
  animate={{ x: 100, y: 50, opacity: 0.5, scale: 1.2 }}
/>

// ❌ Avoid - Forces layout recalculation
<motion.div
  animate={{ width: 100, height: 50, top: 20 }}
/>
```

### 2. Limit Concurrent Animations
```tsx
// ✅ Good - Staggered animations
<StaggeredList staggerDelay={0.1}>
  {items.map(item => <StaggeredItem key={item.id} />)}
</StaggeredList>

// ❌ Avoid - All animations start at once
{items.map(item => <motion.div animate={...} />)}
```

### 3. Use `viewport` with `once: true`
```tsx
// ✅ Good - Animation runs once
<motion.div
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
/>

// ❌ Avoid - Animation runs every time
<motion.div whileInView="visible" />
```

### 4. Optimize for Mobile
```tsx
import { isMobile } from 'react-device-detect';

<motion.div
  animate={{
    scale: isMobile ? 1 : 1.2,
    duration: isMobile ? 0.3 : 0.6
  }}
/>
```

## Page-Specific Animations

### HomePage
- **Hero Section**: Parallax background with staggered text reveals
- **Stats Counter**: Anime.js number counting animation
- **Project Cards**: Hover lift effects with image zoom
- **Testimonials**: Sequential card reveals with rotating stars

### ProjectDetailPage
- **Gallery**: Smooth thumbnail transitions
- **Contact Buttons**: Scale on hover, pulse on tap
- **Info Cards**: Fade-in on scroll with stagger

### Admin Dashboard
- **Sidebar**: Slide-in animation with sequential menu items
- **Cards**: Hover elevation with shadow transitions
- **Modals**: Scale and fade entrance/exit
- **Forms**: Input focus animations

## Performance Monitoring

### Check Animation Performance

```javascript
// In browser console
performance.measure('animation-start', 'animation-end');
const measure = performance.getEntriesByName('animation-start')[0];
console.log(`Animation took: ${measure.duration}ms`);
```

### Target Metrics
- **FPS**: Maintain 60+ FPS during animations
- **Animation Duration**: Keep under 1000ms for most animations
- **Stagger Delay**: 50-150ms between items
- **Interaction Response**: <100ms for hover/click feedback

## Troubleshooting

### Animation Not Running
1. Check if element is in viewport
2. Verify `variants` are correctly defined
3. Ensure `initial` and `animate` props are set
4. Check browser console for errors

### Performance Issues
1. Reduce number of concurrent animations
2. Use `will-change` sparingly
3. Simplify animation complexity on mobile
4. Check for infinite animation loops

### Reduced Motion Not Working
1. Verify `getAnimationVariants()` is being used
2. Test with system preferences: `prefers-reduced-motion: reduce`
3. Ensure fallback animations are defined

## Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Anime.js Documentation](https://animejs.com/documentation/)
- [Web Animation Performance Guide](https://web.dev/animations-guide/)
- [Accessibility Guidelines for Animations](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)

---

**Last Updated**: 2024-12-06
**Maintained By**: Supeva Development Team
