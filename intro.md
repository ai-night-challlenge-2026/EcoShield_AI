# Motivation – EcoShield AI for Smart Water & Energy Management

The transition toward **smart cities** such as Sfax, Tunis, or Sousse is driving the large-scale deployment of IoT sensors to manage public lighting and water distribution, with the goal of reducing energy consumption and water losses.[web:36][web:27] These connected systems, however, become high‑value targets for sophisticated cyberattacks, especially *False Data Injection* (FDI) attacks, where adversaries inject fake measurements into sensors to mislead control algorithms without triggering obvious alarms.[web:36][web:16]

In a water or lighting network, an FDI attack can cause:
- Targeted outages (blackouts) in critical city zones.[web:16]
- Concealment of major leaks or abnormal overconsumption.[web:16][web:48]
- Over‑activation of pumps or equipment, increasing both costs and the carbon footprint.[web:16][web:20]
- Loss of trust in smart city systems and public operators.[web:36][web:27]

At the same time, the Tunisian and Mediterranean context is characterized by:
- Strong water stress and the need for more efficient management of drinking water networks and leak reduction.[web:36]
- Growing pressure on the power grid with demand peaks and a structural need for energy efficiency.[web:36]
- Rapid digitalization of infrastructures, often faster than the upgrade of their cybersecurity capabilities.[web:36][web:27]

This project, *EcoShield AI*, addresses a dual challenge:

1. **Ecological challenge (Green)**  
   Design an AI system capable of optimizing the use of water and energy (for example, targeting up to 30% savings on lighting or pumping) based on sensor data, while reducing waste and indirect emissions related to energy production.[web:36][web:16]

2. **Cybersecurity challenge (Cyber)**  
   Develop an AI “guardian” able to detect corrupted data in real time (FDI, anomalies, suspicious behaviors) and neutralize their impact on decision‑making, in order to preserve service continuity, the physical safety of infrastructures, and citizen trust.[web:36][web:20]

The originality of the project lies in the **combination of these two dimensions**: most existing works focus either on energy or water optimization, or on the detection of cyber‑physical attacks on smart water/energy networks, but rarely on both within the same operational system.[web:36][web:16][web:20] By integrating a “Green” optimization module and a “Cyber” detection module into a single architecture, EcoShield AI proposes a more **holistic** approach where environmental performance does not come at the expense of security.[web:20]

Finally, this project also has a **pedagogical and technological** motivation: it makes it possible to experiment with advanced concepts (IoT, time‑series analysis, anomaly detection, deep learning, smart cities) on a concrete and locally relevant use case, while producing a prototype (notebook, API, and dashboard) that can be directly demonstrated in a hackathon setting or to institutional stakeholders (municipalities, water/energy operators, engineering schools).[web:20][web:36][web:27]

---

## Basic System Architecture

At a high level, EcoShield AI is organized into four main layers:

1. **Sensing & Ingestion Layer**  
   - Smart water and energy meters, pressure and flow sensors, and lighting controllers continuously send time‑series measurements (e.g., flow rate, pressure, tank level, power consumption).[web:36]  
   - A lightweight ingestion service (e.g., MQTT/Kafka or a simple HTTP collector in the prototype) receives these measurements and normalizes them into a unified data format (timestamp, location/node ID, features).

2. **Data Processing & Feature Extraction Layer**  
   - A streaming or micro‑batch pipeline aggregates raw measurements into short time windows (e.g., last 5–15 minutes) and computes features such as moving averages, deltas, variances, and estimated demand profiles for each district or node.[web:16][web:20]  
   - This layer also reconstructs the network view (e.g., which sensors correspond to which pipes, tanks, or lighting zones) to support both optimization and attack detection.[web:36]

3. **AI Core – Green Optimizer & Cyber Guardian**  
   - **Green Optimization Module:**  
     Uses the processed data to compute energy‑efficient control setpoints (e.g., optimal pump schedules, pressure setpoints, or dimming levels for lighting) while respecting operational constraints (minimum service level, pressure, reservoir levels).[web:16]  
   - **Cyber Detection Module:**  
     Implements a data‑driven anomaly detection model (e.g., Autoencoder or LSTM‑based model inspired by recent FDI detection work in smart water infrastructures) that learns normal behavior and outputs an anomaly score for each new window of measurements.[web:20]  
   - A decision logic component cross‑checks optimization recommendations with anomaly scores; if suspicious data is detected, it can block or downgrade certain actions, flag suspect sensors, and fall back to a safe operating mode.[web:20][web:36]

4. **Alerting & Visualization Layer**  
   - A dashboard (e.g., web UI or Jupyter/Streamlit interface) displays real versus optimized consumption curves, estimated energy or water savings, and the status of each zone (normal, suspicious, under attack).[web:20]  
   - Real‑time alerts highlight FDI or anomaly events with a clear visual indicator (e.g., red banner, blinking marker on a network map), and allow operators to inspect recent time‑series and system decisions for transparency and debugging.[web:20][web:36]

In the hackathon‑oriented prototype, these layers are implemented in a simplified way: synthetic or recorded datasets emulate sensor streams; the ingestion and processing logic is coded in a Python notebook or a small API; the AI core runs a trained anomaly detection model plus a basic optimization routine; and the visualization is provided through an interactive dashboard.

---

## References

- Addeen, H. H., Xiao, Y., Li, J., & Guizani, M.  
  **“A Survey of Cyber-Physical Attacks and Detection Methods in Smart Water Distribution Systems.”** IEEE Access, 2021.[web:36][web:27]  
  URL: http://yangxiao.cs.ua.edu/A_Survey_of_Cyber-Physical_Attacks_and_Detection_Methods_in_Smart_Water_Distribution_Systems.pdf

- Moazeni, F., & Khazaei, J.  
  **“Sequential false data injection cyberattacks in water distribution systems.”** Sustainable Cities and Society, 2021.[web:16]  
  URL: https://www.sciencedirect.com/science/article/abs/pii/S2210670721001827

- Giannubilo, T., Giorgeschi, D., et al.  
  **“A Deep Learning Approach for False Data Injection Attacks Detection in Smart Water Infrastructure.”** ITASEC & SERICS 2025 (CEUR-WS, Vol. 3962).[web:20][web:49]  
  URL: https://ceur-ws.org/Vol-3962/paper24.pdf

- Formulating false data injection cyberattacks on pumps' flow rate resulting in cascading failures in smart water systems.[web:48]  
  URL: https://pure.psu.edu/en/publications/formulating-false-data-injection-cyberattacks-on-pumps-flow-rate-/
