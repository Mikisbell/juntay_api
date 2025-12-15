'use client'

import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    z: number // Depth for Parallax
    vx: number
    vy: number
    size: number
    opacity: number
}

export function InteractiveParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const mouseRef = useRef({ x: -1000, y: -1000 })
    const animationRef = useRef<number>()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Antigravity Google Style:
        // - Specific Blue Color (#4285F4)
        // - Fluid "Boids" movement (Flocking)
        // - Network Connections (Constellation)
        // - 3D Parallax Depth

        const particleCount = 120 // Optimization: Reduced from 180 for smoother performance on laptops
        particlesRef.current = []

        for (let i = 0; i < particleCount; i++) {
            const z = Math.random() * 2 + 0.5 // Depth factor: 0.5 (far) to 2.5 (close)
            particlesRef.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: z,
                vx: (Math.random() - 0.5) * 2 * z * 0.5, // Faster if closer
                vy: (Math.random() - 0.5) * 2 * z * 0.5,
                size: (Math.random() * 2 + 1.5) * z * 0.6, // Larger if closer
                opacity: (Math.random() * 0.5 + 0.2) * (z > 1 ? 1 : 0.5) // More opaque if closer
            })
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }
        window.addEventListener('mousemove', handleMouseMove)

        // Boids & Network Parameters
        const visualRange = 120
        const separationDistance = 30
        const centeringFactor = 0.005
        const matchingFactor = 0.05
        const avoidFactor = 0.05
        const maxSpeed = 3
        const mouseAttractionFactor = 0.08
        const connectionDistance = 110

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const particles = particlesRef.current

            // 1. Update Physics (Boids + Parallax)
            particles.forEach((particle, i) => {
                let centerOfMassX = 0
                let centerOfMassY = 0
                let avgVX = 0
                let avgVY = 0
                let neighbors = 0
                let moveX = 0
                let moveY = 0

                particles.forEach((other, j) => {
                    if (i !== j) {
                        const dx = particle.x - other.x
                        const dy = particle.y - other.y
                        const distance = Math.sqrt(dx * dx + dy * dy)

                        if (distance < visualRange) {
                            centerOfMassX += other.x
                            centerOfMassY += other.y
                            avgVX += other.vx
                            avgVY += other.vy
                            neighbors++

                            if (distance < separationDistance) {
                                moveX += dx
                                moveY += dy
                            }
                        }
                    }
                })

                if (neighbors > 0) {
                    centerOfMassX /= neighbors
                    centerOfMassY /= neighbors
                    particle.vx += (centerOfMassX - particle.x) * centeringFactor
                    particle.vy += (centerOfMassY - particle.y) * centeringFactor

                    avgVX /= neighbors
                    avgVY /= neighbors
                    particle.vx += (avgVX - particle.vx) * matchingFactor
                    particle.vy += (avgVY - particle.vy) * matchingFactor
                }

                particle.vx += moveX * avoidFactor
                particle.vy += moveY * avoidFactor

                // Mouse Interaction (Parallax enhanced)
                const dx = mouseRef.current.x - particle.x
                const dy = mouseRef.current.y - particle.y
                const distToMouse = Math.sqrt(dx * dx + dy * dy)

                if (distToMouse < 250) {
                    // Parallax: Closer particles react stronger to mouse
                    const depthFactor = particle.z
                    particle.vx += dx * mouseAttractionFactor * 0.05 * depthFactor
                    particle.vy += dy * mouseAttractionFactor * 0.05 * depthFactor
                }

                // Speed Limit
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
                const adjustedMaxSpeed = maxSpeed * particle.z * 0.8 // Parallax speed limit
                if (speed > adjustedMaxSpeed) {
                    particle.vx = (particle.vx / speed) * adjustedMaxSpeed
                    particle.vy = (particle.vy / speed) * adjustedMaxSpeed
                }

                particle.x += particle.vx
                particle.y += particle.vy

                // Boundary Wrap
                const margin = 50
                if (particle.x < -margin) particle.x = canvas.width + margin
                if (particle.x > canvas.width + margin) particle.x = -margin
                if (particle.y < -margin) particle.y = canvas.height + margin
                if (particle.y > canvas.height + margin) particle.y = -margin
            })

            // 2. Draw Connections (Network Effect)
            // We draw lines BEFORE particles so particles appear on top
            ctx.lineWidth = 0.5
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i]
                    const p2 = particles[j]

                    // Optimization: Only connect if similar depth (optional, but looks cleaner)
                    if (Math.abs(p1.z - p2.z) > 1.5) continue

                    const dx = p1.x - p2.x
                    const dy = p1.y - p2.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < connectionDistance) {
                        const opacity = (1 - distance / connectionDistance) * 0.15 * p1.z // Parallax opacity
                        ctx.strokeStyle = `rgba(66, 133, 244, ${opacity})`
                        ctx.beginPath()
                        ctx.moveTo(p1.x, p1.y)
                        ctx.lineTo(p2.x, p2.y)
                        ctx.stroke()
                    }
                }
            }

            // 3. Draw Particles
            particles.forEach(particle => {
                ctx.fillStyle = `rgba(66, 133, 244, ${particle.opacity})`
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fill()
            })

            animationRef.current = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            window.removeEventListener('mousemove', handleMouseMove)
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
        />
    )
}
