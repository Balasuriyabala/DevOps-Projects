In the ubuntu server prometheus, node exporter, black box exporter, loki, promtail, grafana are installed.

Prometheus, node exporter:

do needed changes in the prometheus.yml configuration file and start the application

check the syntax are correct: ./promtool check config prometheus.yml

nohup ./prometheus --config.file=prometheus.yml > prometheus.log 2>&1 &

nodeexporter: nohup ./node_exporter > node_exporter.log 2>&1 &


<img width="946" height="454" alt="image" src="https://github.com/user-attachments/assets/90535d94-d38f-4820-9f94-b648e265b78f" />



<img width="614" height="316" alt="image" src="https://github.com/user-attachments/assets/310badc4-a841-4a8c-a992-12e8823f83e4" />

# Black box exporter

update the prometheus.yml file for blackbox. start-> nohup ./blackbox_exporter --config.file=blackbox.yml > blackbox.log 2>&1 &


<img width="275" height="462" alt="image" src="https://github.com/user-attachments/assets/6ebe4f0f-2e45-42c8-a50e-6843f4657c72" /> 


# GRAFANA 

Infra Metrics: 

<img width="691" height="332" alt="image" src="https://github.com/user-attachments/assets/323c775e-d246-4785-8f3c-c9cb5d5904a3" />


<img width="902" height="382" alt="image" src="https://github.com/user-attachments/assets/b23dfc2c-56d0-411b-afbb-36dd18cd59e1" />


Blackbox Exporter:

<img width="818" height="397" alt="image" src="https://github.com/user-attachments/assets/93908c7d-cec2-4fb7-b2b7-0089bcce48e2" />


<img width="828" height="249" alt="image" src="https://github.com/user-attachments/assets/93ea3414-f9da-4015-b13e-545555e258dc" />


Application Logs:

<img width="904" height="294" alt="image" src="https://github.com/user-attachments/assets/79e15c2a-e8b7-4873-8b5f-0221e97014e5" /> 

<img width="907" height="437" alt="image" src="https://github.com/user-attachments/assets/23f5aa61-fab4-4867-87f7-25828ad70377" />










