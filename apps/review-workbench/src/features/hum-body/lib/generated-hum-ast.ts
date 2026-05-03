import type { HumAstFile, HumAstForm } from './types';

export const generatedHumAstFiles: HumAstFile[] = [
  {
    "id": "ast-main",
    "label": "main.lisp",
    "filePath": "hum/main.lisp",
    "description": "8 top-level forms parsed from main.lisp.",
    "position": {
      "x": 72,
      "y": 250
    },
    "size": {
      "width": 372,
      "height": 636
    }
  },
  {
    "id": "ast-agent-packages",
    "label": "agent/packages.lisp",
    "filePath": "hum/agent/packages.lisp",
    "description": "8 top-level forms parsed from agent/packages.lisp.",
    "position": {
      "x": 520,
      "y": 250
    },
    "size": {
      "width": 372,
      "height": 636
    }
  },
  {
    "id": "ast-agent-core",
    "label": "agent/core.lisp",
    "filePath": "hum/agent/core.lisp",
    "description": "11 top-level forms parsed from agent/core.lisp.",
    "position": {
      "x": 968,
      "y": 250
    },
    "size": {
      "width": 372,
      "height": 822
    }
  },
  {
    "id": "ast-execution-system",
    "label": "execution/system.lisp",
    "filePath": "hum/execution/system.lisp",
    "description": "21 top-level forms parsed from execution/system.lisp.",
    "position": {
      "x": 72,
      "y": 1090
    },
    "size": {
      "width": 372,
      "height": 1442
    }
  },
  {
    "id": "ast-execution-tools",
    "label": "execution/tools.lisp",
    "filePath": "hum/execution/tools.lisp",
    "description": "24 top-level forms parsed from execution/tools.lisp.",
    "position": {
      "x": 520,
      "y": 1090
    },
    "size": {
      "width": 372,
      "height": 1628
    }
  },
  {
    "id": "ast-agent-context",
    "label": "agent/context.lisp",
    "filePath": "hum/agent/context.lisp",
    "description": "4 top-level forms parsed from agent/context.lisp.",
    "position": {
      "x": 968,
      "y": 1090
    },
    "size": {
      "width": 372,
      "height": 388
    }
  },
  {
    "id": "ast-agent-thoughts",
    "label": "agent/thoughts.lisp",
    "filePath": "hum/agent/thoughts.lisp",
    "description": "4 top-level forms parsed from agent/thoughts.lisp.",
    "position": {
      "x": 72,
      "y": 1930
    },
    "size": {
      "width": 372,
      "height": 388
    }
  },
  {
    "id": "ast-agent-knowledge",
    "label": "agent/knowledge.lisp",
    "filePath": "hum/agent/knowledge.lisp",
    "description": "10 top-level forms parsed from agent/knowledge.lisp.",
    "position": {
      "x": 520,
      "y": 1930
    },
    "size": {
      "width": 372,
      "height": 760
    }
  },
  {
    "id": "ast-energy-core",
    "label": "energy/core.lisp",
    "filePath": "hum/energy/core.lisp",
    "description": "3 top-level forms parsed from energy/core.lisp.",
    "position": {
      "x": 968,
      "y": 1930
    },
    "size": {
      "width": 372,
      "height": 326
    }
  },
  {
    "id": "ast-energy-stats",
    "label": "energy/stats.lisp",
    "filePath": "hum/energy/stats.lisp",
    "description": "8 top-level forms parsed from energy/stats.lisp.",
    "position": {
      "x": 72,
      "y": 2770
    },
    "size": {
      "width": 372,
      "height": 636
    }
  }
];

export const generatedHumAstForms: HumAstForm[] = [
  {
    "id": "ast-main-form-quicklisp-setup-lisp-1",
    "fileId": "ast-main",
    "label": "(load \"~/quicklisp/setup.lisp\" ...)",
    "formType": "load",
    "description": "Top-level load form in hum/main.lisp.",
    "position": {
      "x": 18,
      "y": 74
    }
  },
  {
    "id": "ast-main-form-let-2-2",
    "fileId": "ast-main",
    "label": "(let ((base (make-pathname :directory (pathname-directory *load-truen...",
    "formType": "let",
    "description": "Top-level let form in hum/main.lisp.",
    "position": {
      "x": 18,
      "y": 130
    }
  },
  {
    "id": "ast-main-form-push-3-3",
    "fileId": "ast-main",
    "label": "(push (merge-pathnames \"../truth_machine/cl/\" base) asdf:*central-reg...",
    "formType": "push",
    "description": "Top-level push form in hum/main.lisp.",
    "position": {
      "x": 18,
      "y": 186
    }
  },
  {
    "id": "ast-main-form-ql-quickload-4-4",
    "fileId": "ast-main",
    "label": "(ql:quickload :hum ...)",
    "formType": "ql:quickload",
    "description": "Top-level ql:quickload form in hum/main.lisp.",
    "position": {
      "x": 18,
      "y": 242
    }
  },
  {
    "id": "ast-main-form-ql-quickload-5-5",
    "fileId": "ast-main",
    "label": "(ql:quickload :tractatus/unl ...)",
    "formType": "ql:quickload",
    "description": "Top-level ql:quickload form in hum/main.lisp.",
    "position": {
      "x": 18,
      "y": 298
    }
  },
  {
    "id": "ast-main-form-in-package-6-6",
    "fileId": "ast-main",
    "label": "(in-package :hum.core ...)",
    "formType": "in-package",
    "description": "Switches the reader into package :hum.core.",
    "position": {
      "x": 18,
      "y": 354
    }
  },
  {
    "id": "ast-main-form-main-7",
    "fileId": "ast-main",
    "label": "(defun main ...)",
    "formType": "defun",
    "description": "Defines function main.",
    "position": {
      "x": 18,
      "y": 410
    }
  },
  {
    "id": "ast-main-form-unless-8-8",
    "fileId": "ast-main",
    "label": "(unless (find-package :swank) (main))",
    "formType": "unless",
    "description": "Conditional top-level form in hum/main.lisp.",
    "position": {
      "x": 18,
      "y": 466
    }
  },
  {
    "id": "ast-agent-packages-form-defpackage-1-1",
    "fileId": "ast-agent-packages",
    "label": "(defpackage :hum.system ...)",
    "formType": "defpackage",
    "description": "Declares package :hum.system.",
    "position": {
      "x": 18,
      "y": 74
    }
  },
  {
    "id": "ast-agent-packages-form-defpackage-2-2",
    "fileId": "ast-agent-packages",
    "label": "(defpackage :hum.stats ...)",
    "formType": "defpackage",
    "description": "Declares package :hum.stats.",
    "position": {
      "x": 18,
      "y": 130
    }
  },
  {
    "id": "ast-agent-packages-form-defpackage-3-3",
    "fileId": "ast-agent-packages",
    "label": "(defpackage :hum.tools ...)",
    "formType": "defpackage",
    "description": "Declares package :hum.tools.",
    "position": {
      "x": 18,
      "y": 186
    }
  },
  {
    "id": "ast-agent-packages-form-defpackage-4-4",
    "fileId": "ast-agent-packages",
    "label": "(defpackage :hum.knowledge ...)",
    "formType": "defpackage",
    "description": "Declares package :hum.knowledge.",
    "position": {
      "x": 18,
      "y": 242
    }
  },
  {
    "id": "ast-agent-packages-form-defpackage-5-5",
    "fileId": "ast-agent-packages",
    "label": "(defpackage :hum.context ...)",
    "formType": "defpackage",
    "description": "Declares package :hum.context.",
    "position": {
      "x": 18,
      "y": 298
    }
  },
  {
    "id": "ast-agent-packages-form-defpackage-6-6",
    "fileId": "ast-agent-packages",
    "label": "(defpackage :hum.thoughts ...)",
    "formType": "defpackage",
    "description": "Declares package :hum.thoughts.",
    "position": {
      "x": 18,
      "y": 354
    }
  },
  {
    "id": "ast-agent-packages-form-defpackage-7-7",
    "fileId": "ast-agent-packages",
    "label": "(defpackage :hum.energy ...)",
    "formType": "defpackage",
    "description": "Declares package :hum.energy.",
    "position": {
      "x": 18,
      "y": 410
    }
  },
  {
    "id": "ast-agent-packages-form-defpackage-8-8",
    "fileId": "ast-agent-packages",
    "label": "(defpackage :hum.core ...)",
    "formType": "defpackage",
    "description": "Declares package :hum.core.",
    "position": {
      "x": 18,
      "y": 466
    }
  },
  {
    "id": "ast-agent-core-form-in-package-1-1",
    "fileId": "ast-agent-core",
    "label": "(in-package :hum.core ...)",
    "formType": "in-package",
    "description": "Switches the reader into package :hum.core.",
    "position": {
      "x": 18,
      "y": 74
    }
  },
  {
    "id": "ast-agent-core-form-bootstrap-2",
    "fileId": "ast-agent-core",
    "label": "(defun bootstrap ...)",
    "formType": "defun",
    "description": "Defines function bootstrap.",
    "position": {
      "x": 18,
      "y": 130
    }
  },
  {
    "id": "ast-agent-core-form-get-llm-entrypoint-3",
    "fileId": "ast-agent-core",
    "label": "(defun get-llm-entrypoint ...)",
    "formType": "defun",
    "description": "Defines function get-llm-entrypoint.",
    "position": {
      "x": 18,
      "y": 186
    }
  },
  {
    "id": "ast-agent-core-form-extraer-obj-lisp-4",
    "fileId": "ast-agent-core",
    "label": "(defun extraer-obj-lisp ...)",
    "formType": "defun",
    "description": "Defines function extraer-obj-lisp.",
    "position": {
      "x": 18,
      "y": 242
    }
  },
  {
    "id": "ast-agent-core-form-validate-thought-5",
    "fileId": "ast-agent-core",
    "label": "(defun validate-thought ...)",
    "formType": "defun",
    "description": "Defines function validate-thought.",
    "position": {
      "x": 18,
      "y": 298
    }
  },
  {
    "id": "ast-agent-core-form-extraer-unl-6",
    "fileId": "ast-agent-core",
    "label": "(defun extraer-unl ...)",
    "formType": "defun",
    "description": "Defines function extraer-unl.",
    "position": {
      "x": 18,
      "y": 354
    }
  },
  {
    "id": "ast-agent-core-form-consulta-llm-7",
    "fileId": "ast-agent-core",
    "label": "(defun consulta-llm ...)",
    "formType": "defun",
    "description": "Defines function consulta-llm.",
    "position": {
      "x": 18,
      "y": 410
    }
  },
  {
    "id": "ast-agent-core-form-tu-8",
    "fileId": "ast-agent-core",
    "label": "(think \"tu ...)",
    "formType": "think",
    "description": "Top-level think form in hum/agent/core.lisp.",
    "position": {
      "x": 18,
      "y": 466
    }
  },
  {
    "id": "ast-agent-core-form-ejecutar-accion-9",
    "fileId": "ast-agent-core",
    "label": "(defun ejecutar-accion ...)",
    "formType": "defun",
    "description": "Defines function ejecutar-accion.",
    "position": {
      "x": 18,
      "y": 522
    }
  },
  {
    "id": "ast-agent-core-form-agente-10",
    "fileId": "ast-agent-core",
    "label": "(defun agente ...)",
    "formType": "defun",
    "description": "Defines function agente.",
    "position": {
      "x": 18,
      "y": 578
    }
  },
  {
    "id": "ast-agent-core-form-loop-autopoyetico-11",
    "fileId": "ast-agent-core",
    "label": "(defun loop-autopoyetico ...)",
    "formType": "defun",
    "description": "Defines function loop-autopoyetico.",
    "position": {
      "x": 18,
      "y": 634
    }
  },
  {
    "id": "ast-execution-system-form-in-package-1-1",
    "fileId": "ast-execution-system",
    "label": "(in-package :hum.system ...)",
    "formType": "in-package",
    "description": "Switches the reader into package :hum.system.",
    "position": {
      "x": 18,
      "y": 74
    }
  },
  {
    "id": "ast-execution-system-form-yolo-mode-2",
    "fileId": "ast-execution-system",
    "label": "(defvar *yolo-mode* ...)",
    "formType": "defvar",
    "description": "Defines variable *yolo-mode*.",
    "position": {
      "x": 18,
      "y": 130
    }
  },
  {
    "id": "ast-execution-system-form-desk-dir-3",
    "fileId": "ast-execution-system",
    "label": "(defparameter *desk-dir* ...)",
    "formType": "defparameter",
    "description": "Defines variable *desk-dir*.",
    "position": {
      "x": 18,
      "y": 186
    }
  },
  {
    "id": "ast-execution-system-form-tools-file-4",
    "fileId": "ast-execution-system",
    "label": "(defparameter *tools-file* ...)",
    "formType": "defparameter",
    "description": "Defines variable *tools-file*.",
    "position": {
      "x": 18,
      "y": 242
    }
  },
  {
    "id": "ast-execution-system-form-context-file-5",
    "fileId": "ast-execution-system",
    "label": "(defparameter *context-file* ...)",
    "formType": "defparameter",
    "description": "Defines variable *context-file*.",
    "position": {
      "x": 18,
      "y": 298
    }
  },
  {
    "id": "ast-execution-system-form-knowledge-file-6",
    "fileId": "ast-execution-system",
    "label": "(defparameter *knowledge-file* ...)",
    "formType": "defparameter",
    "description": "Defines variable *knowledge-file*.",
    "position": {
      "x": 18,
      "y": 354
    }
  },
  {
    "id": "ast-execution-system-form-thoughts-file-7",
    "fileId": "ast-execution-system",
    "label": "(defparameter *thoughts-file* ...)",
    "formType": "defparameter",
    "description": "Defines variable *thoughts-file*.",
    "position": {
      "x": 18,
      "y": 410
    }
  },
  {
    "id": "ast-execution-system-form-journal-file-8",
    "fileId": "ast-execution-system",
    "label": "(defparameter *journal-file* ...)",
    "formType": "defparameter",
    "description": "Defines variable *journal-file*.",
    "position": {
      "x": 18,
      "y": 466
    }
  },
  {
    "id": "ast-execution-system-form-stats-file-9",
    "fileId": "ast-execution-system",
    "label": "(defparameter *stats-file* ...)",
    "formType": "defparameter",
    "description": "Defines variable *stats-file*.",
    "position": {
      "x": 18,
      "y": 522
    }
  },
  {
    "id": "ast-execution-system-form-raw-logs-dir-10",
    "fileId": "ast-execution-system",
    "label": "(defparameter *raw-logs-dir* ...)",
    "formType": "defparameter",
    "description": "Defines variable *raw-logs-dir*.",
    "position": {
      "x": 18,
      "y": 578
    }
  },
  {
    "id": "ast-execution-system-form-run-system-command-11",
    "fileId": "ast-execution-system",
    "label": "(defun run-system-command ...)",
    "formType": "defun",
    "description": "Defines function run-system-command.",
    "position": {
      "x": 18,
      "y": 634
    }
  },
  {
    "id": "ast-execution-system-form-git-tree-dirty-p-12",
    "fileId": "ast-execution-system",
    "label": "(defun git-tree-dirty-p ...)",
    "formType": "defun",
    "description": "Defines function git-tree-dirty-p.",
    "position": {
      "x": 18,
      "y": 690
    }
  },
  {
    "id": "ast-execution-system-form-file-tracked-p-13",
    "fileId": "ast-execution-system",
    "label": "(defun file-tracked-p ...)",
    "formType": "defun",
    "description": "Defines function file-tracked-p.",
    "position": {
      "x": 18,
      "y": 746
    }
  },
  {
    "id": "ast-execution-system-form-get-body-merkle-hash-14",
    "fileId": "ast-execution-system",
    "label": "(defun get-body-merkle-hash ...)",
    "formType": "defun",
    "description": "Defines function get-body-merkle-hash.",
    "position": {
      "x": 18,
      "y": 802
    }
  },
  {
    "id": "ast-execution-system-form-validate-action-15",
    "fileId": "ast-execution-system",
    "label": "(defun validate-action ...)",
    "formType": "defun",
    "description": "Defines function validate-action.",
    "position": {
      "x": 18,
      "y": 858
    }
  },
  {
    "id": "ast-execution-system-form-pedir-confirmacion-16",
    "fileId": "ast-execution-system",
    "label": "(defun pedir-confirmacion ...)",
    "formType": "defun",
    "description": "Defines function pedir-confirmacion.",
    "position": {
      "x": 18,
      "y": 914
    }
  },
  {
    "id": "ast-execution-system-form-init-session-17",
    "fileId": "ast-execution-system",
    "label": "(defun init-session ...)",
    "formType": "defun",
    "description": "Defines function init-session.",
    "position": {
      "x": 18,
      "y": 970
    }
  },
  {
    "id": "ast-execution-system-form-commit-state-18",
    "fileId": "ast-execution-system",
    "label": "(defun commit-state ...)",
    "formType": "defun",
    "description": "Defines function commit-state.",
    "position": {
      "x": 18,
      "y": 1026
    }
  },
  {
    "id": "ast-execution-system-form-log-event-19",
    "fileId": "ast-execution-system",
    "label": "(defun log-event ...)",
    "formType": "defun",
    "description": "Defines function log-event.",
    "position": {
      "x": 18,
      "y": 1082
    }
  },
  {
    "id": "ast-execution-system-form-dump-raw-log-20",
    "fileId": "ast-execution-system",
    "label": "(defun dump-raw-log ...)",
    "formType": "defun",
    "description": "Defines function dump-raw-log.",
    "position": {
      "x": 18,
      "y": 1138
    }
  },
  {
    "id": "ast-execution-system-form-sense-fractures-21",
    "fileId": "ast-execution-system",
    "label": "(defun sense-fractures ...)",
    "formType": "defun",
    "description": "Defines function sense-fractures.",
    "position": {
      "x": 18,
      "y": 1194
    }
  },
  {
    "id": "ast-execution-tools-form-in-package-1-1",
    "fileId": "ast-execution-tools",
    "label": "(in-package :hum.tools ...)",
    "formType": "in-package",
    "description": "Switches the reader into package :hum.tools.",
    "position": {
      "x": 18,
      "y": 74
    }
  },
  {
    "id": "ast-execution-tools-form-tools-registry-2",
    "fileId": "ast-execution-tools",
    "label": "(defvar *tools-registry* ...)",
    "formType": "defvar",
    "description": "Defines variable *tools-registry*.",
    "position": {
      "x": 18,
      "y": 130
    }
  },
  {
    "id": "ast-execution-tools-form-def-tool-3",
    "fileId": "ast-execution-tools",
    "label": "(defmacro def-tool ...)",
    "formType": "defmacro",
    "description": "Defines macro def-tool.",
    "position": {
      "x": 18,
      "y": 186
    }
  },
  {
    "id": "ast-execution-tools-form-list-tools-4",
    "fileId": "ast-execution-tools",
    "label": "(defun list-tools ...)",
    "formType": "defun",
    "description": "Defines function list-tools.",
    "position": {
      "x": 18,
      "y": 242
    }
  },
  {
    "id": "ast-execution-tools-form-call-tool-5",
    "fileId": "ast-execution-tools",
    "label": "(defun call-tool ...)",
    "formType": "defun",
    "description": "Defines function call-tool.",
    "position": {
      "x": 18,
      "y": 298
    }
  },
  {
    "id": "ast-execution-tools-form-path-safe-p-6",
    "fileId": "ast-execution-tools",
    "label": "(defun path-safe-p ...)",
    "formType": "defun",
    "description": "Defines function path-safe-p.",
    "position": {
      "x": 18,
      "y": 354
    }
  },
  {
    "id": "ast-execution-tools-form-leer-archivo-7",
    "fileId": "ast-execution-tools",
    "label": "(defun leer-archivo ...)",
    "formType": "defun",
    "description": "Defines function leer-archivo.",
    "position": {
      "x": 18,
      "y": 410
    }
  },
  {
    "id": "ast-execution-tools-form-escribir-archivo-8",
    "fileId": "ast-execution-tools",
    "label": "(defun escribir-archivo ...)",
    "formType": "defun",
    "description": "Defines function escribir-archivo.",
    "position": {
      "x": 18,
      "y": 466
    }
  },
  {
    "id": "ast-execution-tools-form-borrar-archivo-9",
    "fileId": "ast-execution-tools",
    "label": "(defun borrar-archivo ...)",
    "formType": "defun",
    "description": "Defines function borrar-archivo.",
    "position": {
      "x": 18,
      "y": 522
    }
  },
  {
    "id": "ast-execution-tools-form-listar-directorio-10",
    "fileId": "ast-execution-tools",
    "label": "(defun listar-directorio ...)",
    "formType": "defun",
    "description": "Defines function listar-directorio.",
    "position": {
      "x": 18,
      "y": 578
    }
  },
  {
    "id": "ast-execution-tools-form-sldb-extraer-11",
    "fileId": "ast-execution-tools",
    "label": "(defun sldb-extraer ...)",
    "formType": "defun",
    "description": "Defines function sldb-extraer.",
    "position": {
      "x": 18,
      "y": 634
    }
  },
  {
    "id": "ast-execution-tools-form-inspeccionar-self-12",
    "fileId": "ast-execution-tools",
    "label": "(defun inspeccionar-self ...)",
    "formType": "defun",
    "description": "Defines function inspeccionar-self.",
    "position": {
      "x": 18,
      "y": 690
    }
  },
  {
    "id": "ast-execution-tools-form-leer-tareas-13",
    "fileId": "ast-execution-tools",
    "label": "(defun leer-tareas ...)",
    "formType": "defun",
    "description": "Defines function leer-tareas.",
    "position": {
      "x": 18,
      "y": 746
    }
  },
  {
    "id": "ast-execution-tools-form-query-g-14",
    "fileId": "ast-execution-tools",
    "label": "(defun query-g ...)",
    "formType": "defun",
    "description": "Defines function query-g.",
    "position": {
      "x": 18,
      "y": 802
    }
  },
  {
    "id": "ast-execution-tools-form-persist-to-g-15",
    "fileId": "ast-execution-tools",
    "label": "(defun persist-to-g ...)",
    "formType": "defun",
    "description": "Defines function persist-to-g.",
    "position": {
      "x": 18,
      "y": 858
    }
  },
  {
    "id": "ast-execution-tools-form-setf-16-16",
    "fileId": "ast-execution-tools",
    "label": "(setf (gethash \"sldb-extraer\" *tools-registry*) '(:doc \"Extrae datos ...",
    "formType": "setf",
    "description": "Mutates runtime state through hum/execution/tools.lisp.",
    "position": {
      "x": 18,
      "y": 914
    }
  },
  {
    "id": "ast-execution-tools-form-setf-17-17",
    "fileId": "ast-execution-tools",
    "label": "(setf (gethash \"query-g\" *tools-registry*) '(:doc \"Consulta kgdb (Mem...",
    "formType": "setf",
    "description": "Mutates runtime state through hum/execution/tools.lisp.",
    "position": {
      "x": 18,
      "y": 970
    }
  },
  {
    "id": "ast-execution-tools-form-setf-18-18",
    "fileId": "ast-execution-tools",
    "label": "(setf (gethash \"persist-to-g\" *tools-registry*) '(:doc \"Persiste cono...",
    "formType": "setf",
    "description": "Mutates runtime state through hum/execution/tools.lisp.",
    "position": {
      "x": 18,
      "y": 1026
    }
  },
  {
    "id": "ast-execution-tools-form-setf-19-19",
    "fileId": "ast-execution-tools",
    "label": "(setf (gethash \"inspeccionar-self\" *tools-registry*) '(:doc \"Estado a...",
    "formType": "setf",
    "description": "Mutates runtime state through hum/execution/tools.lisp.",
    "position": {
      "x": 18,
      "y": 1082
    }
  },
  {
    "id": "ast-execution-tools-form-setf-20-20",
    "fileId": "ast-execution-tools",
    "label": "(setf (gethash \"leer-archivo\" *tools-registry*) '(:doc \"Lee un archiv...",
    "formType": "setf",
    "description": "Mutates runtime state through hum/execution/tools.lisp.",
    "position": {
      "x": 18,
      "y": 1138
    }
  },
  {
    "id": "ast-execution-tools-form-setf-21-21",
    "fileId": "ast-execution-tools",
    "label": "(setf (gethash \"escribir-archivo\" *tools-registry*) '(:doc \"Escribe u...",
    "formType": "setf",
    "description": "Mutates runtime state through hum/execution/tools.lisp.",
    "position": {
      "x": 18,
      "y": 1194
    }
  },
  {
    "id": "ast-execution-tools-form-setf-22-22",
    "fileId": "ast-execution-tools",
    "label": "(setf (gethash \"borrar-archivo\" *tools-registry*) '(:doc \"Borra un ar...",
    "formType": "setf",
    "description": "Mutates runtime state through hum/execution/tools.lisp.",
    "position": {
      "x": 18,
      "y": 1250
    }
  },
  {
    "id": "ast-execution-tools-form-setf-23-23",
    "fileId": "ast-execution-tools",
    "label": "(setf (gethash \"listar-directorio\" *tools-registry*) '(:doc \"Lista ar...",
    "formType": "setf",
    "description": "Mutates runtime state through hum/execution/tools.lisp.",
    "position": {
      "x": 18,
      "y": 1306
    }
  },
  {
    "id": "ast-execution-tools-form-setf-24-24",
    "fileId": "ast-execution-tools",
    "label": "(setf (gethash \"leer-tareas\" *tools-registry*) '(:doc \"Lee las tareas...",
    "formType": "setf",
    "description": "Mutates runtime state through hum/execution/tools.lisp.",
    "position": {
      "x": 18,
      "y": 1362
    }
  },
  {
    "id": "ast-agent-context-form-in-package-1-1",
    "fileId": "ast-agent-context",
    "label": "(in-package :hum.context ...)",
    "formType": "in-package",
    "description": "Switches the reader into package :hum.context.",
    "position": {
      "x": 18,
      "y": 74
    }
  },
  {
    "id": "ast-agent-context-form-abstract-context-2",
    "fileId": "ast-agent-context",
    "label": "(defvar *abstract-context* ...)",
    "formType": "defvar",
    "description": "Defines variable *abstract-context*.",
    "position": {
      "x": 18,
      "y": 130
    }
  },
  {
    "id": "ast-agent-context-form-save-context-3",
    "fileId": "ast-agent-context",
    "label": "(defun save-context ...)",
    "formType": "defun",
    "description": "Defines function save-context.",
    "position": {
      "x": 18,
      "y": 186
    }
  },
  {
    "id": "ast-agent-context-form-load-context-4",
    "fileId": "ast-agent-context",
    "label": "(defun load-context ...)",
    "formType": "defun",
    "description": "Defines function load-context.",
    "position": {
      "x": 18,
      "y": 242
    }
  },
  {
    "id": "ast-agent-thoughts-form-in-package-1-1",
    "fileId": "ast-agent-thoughts",
    "label": "(in-package :hum.thoughts ...)",
    "formType": "in-package",
    "description": "Switches the reader into package :hum.thoughts.",
    "position": {
      "x": 18,
      "y": 74
    }
  },
  {
    "id": "ast-agent-thoughts-form-chain-of-thought-2",
    "fileId": "ast-agent-thoughts",
    "label": "(defvar *chain-of-thought* ...)",
    "formType": "defvar",
    "description": "Defines variable *chain-of-thought*.",
    "position": {
      "x": 18,
      "y": 130
    }
  },
  {
    "id": "ast-agent-thoughts-form-add-thought-3",
    "fileId": "ast-agent-thoughts",
    "label": "(defun add-thought ...)",
    "formType": "defun",
    "description": "Defines function add-thought.",
    "position": {
      "x": 18,
      "y": 186
    }
  },
  {
    "id": "ast-agent-thoughts-form-save-thoughts-4",
    "fileId": "ast-agent-thoughts",
    "label": "(defun save-thoughts ...)",
    "formType": "defun",
    "description": "Defines function save-thoughts.",
    "position": {
      "x": 18,
      "y": 242
    }
  },
  {
    "id": "ast-agent-knowledge-form-in-package-1-1",
    "fileId": "ast-agent-knowledge",
    "label": "(in-package :hum.knowledge ...)",
    "formType": "in-package",
    "description": "Switches the reader into package :hum.knowledge.",
    "position": {
      "x": 18,
      "y": 74
    }
  },
  {
    "id": "ast-agent-knowledge-form-knowledge-base-2",
    "fileId": "ast-agent-knowledge",
    "label": "(defvar *knowledge-base* ...)",
    "formType": "defvar",
    "description": "Defines variable *knowledge-base*.",
    "position": {
      "x": 18,
      "y": 130
    }
  },
  {
    "id": "ast-agent-knowledge-form-domains-3",
    "fileId": "ast-agent-knowledge",
    "label": "(defvar *domains* ...)",
    "formType": "defvar",
    "description": "Defines variable *domains*.",
    "position": {
      "x": 18,
      "y": 186
    }
  },
  {
    "id": "ast-agent-knowledge-form-def-domain-4",
    "fileId": "ast-agent-knowledge",
    "label": "(defmacro def-domain ...)",
    "formType": "defmacro",
    "description": "Defines macro def-domain.",
    "position": {
      "x": 18,
      "y": 242
    }
  },
  {
    "id": "ast-agent-knowledge-form-validate-data-5",
    "fileId": "ast-agent-knowledge",
    "label": "(defun validate-data ...)",
    "formType": "defun",
    "description": "Defines function validate-data.",
    "position": {
      "x": 18,
      "y": 298
    }
  },
  {
    "id": "ast-agent-knowledge-form-def-knowledge-6",
    "fileId": "ast-agent-knowledge",
    "label": "(defmacro def-knowledge ...)",
    "formType": "defmacro",
    "description": "Defines macro def-knowledge.",
    "position": {
      "x": 18,
      "y": 354
    }
  },
  {
    "id": "ast-agent-knowledge-form-ingest-json-knowledge-7",
    "fileId": "ast-agent-knowledge",
    "label": "(defun ingest-json-knowledge ...)",
    "formType": "defun",
    "description": "Defines function ingest-json-knowledge.",
    "position": {
      "x": 18,
      "y": 410
    }
  },
  {
    "id": "ast-agent-knowledge-form-add-knowledge-8",
    "fileId": "ast-agent-knowledge",
    "label": "(defun add-knowledge ...)",
    "formType": "defun",
    "description": "Defines function add-knowledge.",
    "position": {
      "x": 18,
      "y": 466
    }
  },
  {
    "id": "ast-agent-knowledge-form-save-knowledge-9",
    "fileId": "ast-agent-knowledge",
    "label": "(defun save-knowledge ...)",
    "formType": "defun",
    "description": "Defines function save-knowledge.",
    "position": {
      "x": 18,
      "y": 522
    }
  },
  {
    "id": "ast-agent-knowledge-form-load-knowledge-10",
    "fileId": "ast-agent-knowledge",
    "label": "(defun load-knowledge ...)",
    "formType": "defun",
    "description": "Defines function load-knowledge.",
    "position": {
      "x": 18,
      "y": 578
    }
  },
  {
    "id": "ast-energy-core-form-in-package-1-1",
    "fileId": "ast-energy-core",
    "label": "(in-package :hum.energy ...)",
    "formType": "in-package",
    "description": "Switches the reader into package :hum.energy.",
    "position": {
      "x": 18,
      "y": 74
    }
  },
  {
    "id": "ast-energy-core-form-measure-entropy-2",
    "fileId": "ast-energy-core",
    "label": "(defun measure-entropy ...)",
    "formType": "defun",
    "description": "Defines function measure-entropy.",
    "position": {
      "x": 18,
      "y": 130
    }
  },
  {
    "id": "ast-energy-core-form-calculate-systemic-energy-3",
    "fileId": "ast-energy-core",
    "label": "(defun calculate-systemic-energy ...)",
    "formType": "defun",
    "description": "Defines function calculate-systemic-energy.",
    "position": {
      "x": 18,
      "y": 186
    }
  },
  {
    "id": "ast-energy-stats-form-in-package-1-1",
    "fileId": "ast-energy-stats",
    "label": "(in-package :hum.stats ...)",
    "formType": "in-package",
    "description": "Switches the reader into package :hum.stats.",
    "position": {
      "x": 18,
      "y": 74
    }
  },
  {
    "id": "ast-energy-stats-form-total-tokens-2",
    "fileId": "ast-energy-stats",
    "label": "(defvar *total-tokens* ...)",
    "formType": "defvar",
    "description": "Defines variable *total-tokens*.",
    "position": {
      "x": 18,
      "y": 130
    }
  },
  {
    "id": "ast-energy-stats-form-g-hits-3",
    "fileId": "ast-energy-stats",
    "label": "(defvar *g-hits* ...)",
    "formType": "defvar",
    "description": "Defines variable *g-hits*.",
    "position": {
      "x": 18,
      "y": 186
    }
  },
  {
    "id": "ast-energy-stats-form-llm-calls-4",
    "fileId": "ast-energy-stats",
    "label": "(defvar *llm-calls* ...)",
    "formType": "defvar",
    "description": "Defines variable *llm-calls*.",
    "position": {
      "x": 18,
      "y": 242
    }
  },
  {
    "id": "ast-energy-stats-form-add-tokens-5",
    "fileId": "ast-energy-stats",
    "label": "(defun add-tokens ...)",
    "formType": "defun",
    "description": "Defines function add-tokens.",
    "position": {
      "x": 18,
      "y": 298
    }
  },
  {
    "id": "ast-energy-stats-form-register-g-hit-6",
    "fileId": "ast-energy-stats",
    "label": "(defun register-g-hit ...)",
    "formType": "defun",
    "description": "Defines function register-g-hit.",
    "position": {
      "x": 18,
      "y": 354
    }
  },
  {
    "id": "ast-energy-stats-form-register-llm-call-7",
    "fileId": "ast-energy-stats",
    "label": "(defun register-llm-call ...)",
    "formType": "defun",
    "description": "Defines function register-llm-call.",
    "position": {
      "x": 18,
      "y": 410
    }
  },
  {
    "id": "ast-energy-stats-form-save-stats-8",
    "fileId": "ast-energy-stats",
    "label": "(defun save-stats ...)",
    "formType": "defun",
    "description": "Defines function save-stats.",
    "position": {
      "x": 18,
      "y": 466
    }
  }
];
