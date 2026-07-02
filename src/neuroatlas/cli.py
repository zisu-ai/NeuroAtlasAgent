import argparse
import json

from .service import NeuroAtlasService


def main() -> None:
    parser = argparse.ArgumentParser(prog="neuroatlas")
    subparsers = parser.add_subparsers(dest="command", required=True)
    ask_parser = subparsers.add_parser("ask", help="Ask a graph-grounded anatomy question")
    ask_parser.add_argument("question")
    args = parser.parse_args()
    if args.command == "ask":
        print(json.dumps(NeuroAtlasService().ask(args.question).to_dict(), indent=2))


if __name__ == "__main__":
    main()

