# Lagrangian Mechanics & Double Pendulum Chaos

The double pendulum is one of the classic paradigms of non-linear dynamics and deterministic chaos. Despite having simple equations of motion derived from Newton's laws, its trajectories exhibit extreme sensitivity to initial conditions.

---

## The Lagrangian Formulation

To model the double pendulum, we define the generalized coordinates as the angle of the first rod $\theta_1$ and the second rod $\theta_2$ relative to the downward vertical.

The positions of the two bobs in Cartesian coordinates are:

$$ x_1 = l_1 \sin\theta_1, \quad y_1 = -l_1 \cos\theta_1 $$

$$ x_2 = l_1 \sin\theta_1 + l_2 \sin\theta_2, \quad y_2 = -l_1 \cos\theta_1 - l_2 \cos\theta_2 $$

The kinetic energy $T$ and potential energy $V$ of the system are written as:

$$ T = \frac{1}{2} m_1 l_1^2 \dot{\theta}_1^2 + \frac{1}{2} m_2 \left( l_1^2 \dot{\theta}_1^2 + l_2^2 \dot{\theta}_2^2 + 2 l_1 l_2 \dot{\theta}_1 \dot{\theta}_2 \cos(\theta_1 - \theta_2) \right) $$

$$ V = -(m_1 + m_2) g l_1 \cos\theta_1 - m_2 g l_2 \cos\theta_2 $$

The Lagrangian $L = T - V$ yields the Euler-Lagrange equations of motion:

$$ \frac{d}{dt} \left( \frac{\partial L}{\partial \dot{\theta}_i} \right) - \frac{\partial L}{\partial \theta_i} = 0, \quad i \in \{1, 2\} $$

---

## Equations of Motion

Solving the system yields two coupled non-linear second-order differential equations for angular accelerations $\ddot{\theta}_1$ and $\ddot{\ddot{\theta}_2}$:

$$ \ddot{\theta}_1 = \frac{-g(2m_1 + m_2)\sin\theta_1 - m_2 g \sin(\theta_1 - 2\theta_2) - 2\sin(\theta_1 - \theta_2) m_2 \left(\dot{\theta}_2^2 l_2 + \dot{\theta}_1^2 l_1 \cos(\theta_1 - \theta_2)\right)}{l_1 \left(2m_1 + m_2 - m_2 \cos(2\theta_1 - 2\theta_2)\right)} $$

---

## Phase Space Trajectories & Chaos

Because the phase space is 4-dimensional $(\theta_1, \theta_2, p_1, p_2)$, phase space orbits cannot self-intersect. At higher total energy $E$, the motion transitions from quasi-periodic motion to deterministic chaos, characterized by positive Lyapunov exponents $\lambda > 0$.
