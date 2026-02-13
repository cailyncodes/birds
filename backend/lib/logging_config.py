import logging
import sys


def configure_logging(log_level: int = logging.INFO) -> None:
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    stdout_handler = logging.StreamHandler(sys.stdout)
    stdout_handler.setLevel(log_level)
    stdout_handler.setFormatter(formatter)
    stdout_handler.addFilter(lambda record: record.levelno < logging.ERROR)
    root_logger.addHandler(stdout_handler)

    stderr_handler = logging.StreamHandler(sys.stderr)
    stderr_handler.setLevel(logging.ERROR)
    stderr_handler.setFormatter(formatter)
    root_logger.addHandler(stderr_handler)

    logging.info("Logging configured successfully")


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
