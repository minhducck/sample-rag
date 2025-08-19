# Naive RAG Project

This project is a naive Retrieval-Augmented Generation (RAG) system. It'''s designed to ingest data from various online sources, store it in a FAISS vector store, and then use that data to answer user prompts.

## Features

*   Ingests data from various web sources (e.g., Toto lottery results, Y Combinator Hacker News).
*   Uses a FAISS vector store for efficient similarity search.
*   Provides a command-line interface for asking questions.
*   Built with TypeScript and LangChain.js.

## Technologies Used

*   **Language**: TypeScript
*   **Runtime**: Node.js
*   **Core Frameworks**:
    *   LangChain.js: For building the RAG pipeline.
    *   InversifyJS: For dependency injection.
    *   Faiss-node: For the vector store.
*   **Package Manager**: Yarn

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   Yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Install the dependencies:
    ```bash
    yarn install
    ```

### Configuration

1.  Create a `.env` file by copying the `.env.sample` file:
    ```bash
    cp .env.sample .env
    ```
2.  Update the `.env` file with your configuration, such as API keys for any services you want to use.

## Usage

### Indexing Data

To ingest data from the sources, run the indexer scripts:

**Index Toto lottery results:**

```bash
yarn index:toto
```

**Index Y Combinator Hacker News posts:**

```bash
yarn index:ycom
```

### Running Prompts

To ask a question, use the `start` script and pass your question as an argument:

```bash
yarn start "Your question here"
```

For example:

```bash
yarn start "What are the latest trends in AI?"
```

## Project Structure

```
.
├── src/
│   ├── apps/             # Data sources and services
│   ├── clients/          # HTTP and other clients
│   ├── configuration/    # Application configuration and DI container
│   ├── generators/       # Chat generation logic
│   ├── indexers/         # Scripts to index data
│   ├── storages/         # Vector store implementation
│   └── index.ts          # Main entry point for prompts
├── .env.sample           # Sample environment variables
├── package.json          # Project dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```
