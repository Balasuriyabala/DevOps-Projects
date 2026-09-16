# This Project is for Monitoring and Obserability 

Tech stack used:  Prometheus, Grafana, Node exporter, Blackbox exporter 

                    ┌─────────────────────┐
                    │      Users          │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Nginx         │
                    │   Reverse Proxy     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Your Application │
                    │      Docker         │
                    └─────────────────────┘

       
                        Monitoring                   
                                                     
         Node Exporter ──────► Prometheus            
                                     │               
         Blackbox Exporter ───► Prometheus           
                                     │               
                                     ▼               
                                  Grafana            
      

# Architecture Overview

                ┌───────────────┐
                │   Grafana     │  ← visualization layer
                └───────┬───────┘
            ┌───────────┴───────────┐
            │                       │
    ┌───────▼───────┐       ┌───────▼───────┐
    │  Prometheus   │       │     Loki      │
    │  (metrics DB) │       │  (log store)  │
    └───────┬───────┘       └───────┬───────┘
            │                       │
   ┌────────┼──                     │
   │        │                       │
┌──▼──┐ ┌───▼───┐              ┌────▼────┐
│node_│ │blackbox│             │Promtail │
│exp. │ │exporter│             │(log ship│
└─────┘ └────────┘                                      





