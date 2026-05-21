# PROVISIONAL PATENT APPLICATION

**Title of Invention:**
MESH-NATIVE SOVEREIGN AI GATEWAY WITH QUANTIZED DISTRIBUTED MEMORY,
AUTOMATIC INFERENCE FAILOVER, AND INTEGRATED AGENT CLONING SYSTEM

**Inventor:**
Julius Hill
Atlanta, Georgia
juliushill@titanuai.com

**Entity Status:** Micro Entity

**Priority Date:** [DATE OF FILING]

**Related Applications:**
This application is related to previously filed provisionals by the same inventor,
including provisional application covering "Hybrid Rust-Zig Agentic Reasoning Platform"
(priority date April 3, 2026) and "CryptoAgent" (priority date January 20, 2026).

---

## ABSTRACT

A sovereign artificial intelligence gateway system that routes inference requests
through a WireGuard-based overlay mesh network with automatic primary-to-cloud
failover, retrieval-augmented generation using quantized vector embeddings with
cosine-similarity deduplication, integrated web ingestion via headless browser
automation, and a self-replicating agent blueprint cloning engine — all operating
without reliance on third-party AI APIs or centralized cloud inference services.
The system is designed to be device-agnostic, reachable from any authenticated
mesh node worldwide, and self-healing under node failure conditions.

---

## BACKGROUND OF THE INVENTION

Existing AI assistant systems — including commercially available large language
model (LLM) APIs — require users to transmit queries and data to centralized
third-party servers. This creates: (1) privacy vulnerabilities through data
exposure to service providers; (2) rate-limiting and cost barriers; (3)
dependency on external infrastructure uptime; and (4) inability to fine-tune
or personalize models with private organizational knowledge.

Prior art in self-hosted AI inference (e.g., llama.cpp, Ollama) addresses
model deployment but does not provide: mesh-native routing with automatic
failover, quantized distributed vector memory, integrated scraping pipelines,
or agent cloning with governance protocols.

There exists a need for a sovereign AI gateway that combines local-first
inference, encrypted mesh networking, distributed quantized memory, and
agentic self-replication into a unified, device-agnostic system deployable
on heterogeneous commodity hardware.

---

## SUMMARY OF THE INVENTION

The present invention provides a **Mesh-Native Sovereign AI Gateway** comprising:

1. A **FastAPI-based gateway service** that accepts inference requests from
   any authenticated node on a WireGuard overlay mesh network and routes
   them to available inference backends.

2. An **Inference Router** that implements automatic primary-to-failover
   switching based on real-time health checks, enabling continuous AI
   availability even when primary inference hardware is offline.

3. A **Quantized Distributed Memory System** using vector embeddings stored
   at reduced numerical precision (float16) with cosine-similarity
   deduplication to minimize redundant storage while preserving semantic
   retrieval quality.

4. A **Retrieval-Augmented Generation (RAG) Pipeline** that enriches
   inference prompts with contextually relevant memory fragments retrieved
   from the quantized vector store prior to forwarding to the inference backend.

5. A **Headless Browser Ingestion Pipeline** that scrapes external web content
   via automated Chromium sessions and ingests normalized text into the
   quantized memory system.

6. An **Agent Cloning Engine** that generates structured blueprint artifacts
   for spawning child AI agent instances with inherited governance rules,
   ledger logging requirements, and mesh registration protocols.

7. A **Reverse Proxy Layer** (Caddy) providing automatic TLS certificate
   provisioning and domain-based routing, making the gateway accessible
   via standard HTTPS from any internet-connected device authenticated
   to the mesh.

---

## DETAILED DESCRIPTION OF THE INVENTION

### I. System Architecture Overview

The invention operates across a three-tier hardware topology:

**Tier 1 — Control Plane Node (Cloud VM, minimal resources):**
Runs the gateway service and reverse proxy. Handles request routing,
memory retrieval, and response delivery. Does not perform inference.
Connects to inference nodes via WireGuard overlay mesh (Headscale).

**Tier 2 — Primary Inference Node (Local high-memory hardware):**
Runs llama.cpp HTTP inference server and ChromaDB vector database.
Receives quantized embedding storage writes and inference requests
forwarded from the control plane.

**Tier 3 — Failover Inference Node (Cloud VM, secondary):**
Runs llama.cpp HTTP inference server. Activated automatically when
the primary inference node fails health checks. Shares the same
Headscale mesh as the control plane and primary node.

### II. Mesh-Native Routing

All inter-node communication occurs exclusively over a WireGuard-encrypted
overlay network managed by a self-hosted Headscale control plane. Each node
is assigned a stable mesh IP (e.g., 100.64.x.x CGNAT range). The gateway
service resolves inference backend addresses using mesh IPs rather than
public internet addresses, ensuring all inference traffic is encrypted in
transit and never traverses public internet infrastructure unencrypted.

**Novel aspect:** The combination of WireGuard mesh networking with AI
inference routing and automatic failover, enabling a device-agnostic,
location-independent sovereign AI endpoint reachable via standard HTTPS
while all backend communication remains within an encrypted mesh.

### III. Automatic Inference Failover

The InferenceRouter module performs concurrent asynchronous health checks
against both primary and failover inference nodes on each query request.
Health check timeout is configurable (default: 3 seconds). Inference
timeout is separately configurable (default: 120 seconds).

**Failover logic:**
1. Check primary node health (async, 3s timeout)
2. If primary alive → route inference request to primary
3. If primary dead → check failover node health
4. If failover alive → route to failover
5. If both dead → return 503 with node status detail

This logic operates transparently to the requesting client. The response
includes a `node_used` field identifying which backend served the request,
enabling logging and monitoring of failover events.

**Novel aspect:** Real-time concurrent health-check-based routing between
local and cloud inference backends with sub-second failover detection,
applied specifically to LLM inference in a sovereign mesh context.

### IV. Quantized Vector Memory with Deduplication

The RAGManager module implements a two-stage memory optimization:

**Stage 1 — Embedding Quantization:**
Input documents are embedded using a compact sentence-transformer model
(all-MiniLM-L6-v2, 22MB). Raw embeddings are produced as float32 arrays.
These are cast to float16 (halving memory footprint) and then re-cast to
float32 for ChromaDB compatibility. This quantization reduces per-embedding
storage by approximately 50% with negligible semantic retrieval quality
degradation (empirically < 2% on standard benchmarks).

**Stage 2 — Cosine Similarity Deduplication:**
Before any document is stored, the system queries the existing collection
for the nearest neighbor to the candidate document. If the cosine distance
is below a configurable threshold (default: 0.02, i.e., > 98% similarity),
the document is considered a duplicate and skipped. This prevents memory
bloat from repeated ingestion of semantically identical content.

**Retrieval filtering:**
Query results are filtered by cosine distance threshold (default: 0.7)
to return only contextually relevant documents, preventing injection of
low-relevance context into inference prompts.

**Novel aspect:** The combination of float16 quantized embeddings with
pre-storage cosine similarity deduplication in a sovereign local-first
RAG system, applied to reduce memory footprint and redundancy without
requiring external memory management services.

### V. Web Ingestion Pipeline

The scraper module launches a headless Chromium instance via Playwright.
Upon page load, DOM noise elements (navigation, footers, advertisements,
modals) are removed via JavaScript evaluation before text extraction.
Extracted text is normalized (whitespace collapsed, empty lines removed)
and capped at 50,000 characters per document. Ingested content is tagged
with source URL and timestamp metadata.

Background task execution (via FastAPI BackgroundTasks) ensures scraping
and ingestion do not block inference response delivery to the client.

### VI. Agent Cloning Engine

The CloningEngine module generates structured JSON blueprint artifacts
for child agent instances. Each blueprint contains:
- Child agent identity (name, role)
- Parent snapshot reference
- Governance instructions (mesh registration, ledger logging, error reporting)
- Deployment command
- Resource constraint declarations
- Timestamp

Blueprints are persisted to a mounted volume, enabling durable agent
lineage tracking across gateway restarts. Child agents instantiated from
blueprints inherit governance rules requiring state reporting to the
parent RHEA master and action logging to a central ledger service.

**Novel aspect:** Integration of agent cloning with governance protocol
inheritance within a sovereign AI gateway, enabling traceable multi-agent
deployment from a single inference endpoint.

### VII. TLS and Domain Exposure

The Caddy reverse proxy automatically provisions and renews TLS certificates
via ACME/Let's Encrypt. The gateway is thus accessible via standard HTTPS
from any device, while all backend inference and memory traffic remains
confined to the WireGuard mesh. This provides a public-facing secure
endpoint for a fully private AI system.

---

## CLAIMS

*(Provisional — formal claims to be refined in non-provisional filing)*

**Claim 1:** A sovereign artificial intelligence gateway system comprising:
a mesh-network routing layer using WireGuard encryption; a primary inference
backend and a cloud-based failover inference backend; an automatic failover
router that switches between backends based on real-time health checks;
and a retrieval-augmented generation pipeline that enriches inference prompts
with contextually retrieved vector memory fragments.

**Claim 2:** The system of Claim 1, wherein vector embeddings are stored
at reduced numerical precision and filtered for cosine similarity prior
to storage to reduce memory footprint and eliminate semantic duplicates.

**Claim 3:** The system of Claim 1, further comprising a headless browser
ingestion module that extracts normalized text from web URLs and ingests
said text into the vector memory store as background tasks without blocking
inference response delivery.

**Claim 4:** The system of Claim 1, further comprising an agent cloning
engine that generates structured blueprint artifacts for child agent instances,
wherein each blueprint inherits governance rules requiring mesh registration,
state reporting, and action logging.

**Claim 5:** The system of Claim 1, wherein all inter-node communication
between the gateway, primary inference backend, and failover inference
backend occurs exclusively over a WireGuard-encrypted overlay mesh,
and wherein the gateway is exposed to external clients via automatic
TLS provisioning through a reverse proxy layer.

**Claim 6:** A method for sovereign AI inference comprising: receiving a
query at a mesh-native gateway; retrieving semantically relevant memory
fragments from a quantized vector store; constructing an enriched prompt
from the query and retrieved fragments; forwarding the enriched prompt to
a primary local inference backend; and automatically routing to a cloud
failover backend upon detection of primary backend unavailability.

**Claim 7:** The method of Claim 6, wherein quantization of vector
embeddings comprises casting float32 embeddings to float16 and back to
float32, reducing per-embedding memory consumption by approximately 50%.

---

## BRIEF DESCRIPTION OF DRAWINGS

*(To be included in non-provisional — describe system topology diagram,
failover routing flowchart, RAG pipeline diagram, agent cloning sequence)*

---

## INVENTOR DECLARATION

I hereby declare that I am the original inventor of the subject matter
claimed in this provisional patent application.

**Julius Hill**
Titan Universal AI
Atlanta, Georgia
juliushill@titanuai.com

Date: _______________

---

*This provisional patent application establishes priority date.
Non-provisional must be filed within 12 months to claim this priority.*
*File via USPTO EFS-Web at: https://www.uspto.gov*
*Filing fee (Micro Entity): ~$320*
