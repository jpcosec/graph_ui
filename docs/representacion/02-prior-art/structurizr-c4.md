# Structurizr y el modelo C4

## Qué es

Structurizr es una herramienta de *models as code* para el modelo C4 de arquitectura de software:
*"You write Structurizr DSL, and Structurizr renders diagrams."* (documentación, *Why "as code"?*).
El modelo C4 describe un sistema en niveles de zoom: contexto de sistema, contenedores, componentes
y código.

Interesa por una idea central: **un solo modelo, muchas vistas**, con una separación explícita
entre contenido y presentación.

## Arquitectura

Un *workspace* tiene dos bloques:

- **`model`**: los elementos (personas, sistemas de software, contenedores, componentes) y sus
  relaciones. Es el contenido.
- **`views`**: vistas sobre ese modelo (contexto, contenedores, paisaje de sistemas…) y **`styles`**.
  Es la presentación.

La documentación lo subraya: *"The Structurizr DSL specifically provides a clean separation between
the model (content) and views (presentation), which further enhances the ability to diff versions
when compared to most other text-based formats that mix content and presentation."*

## Cómo declara el mapeo semántico → notación

- **Tipo de elemento** (`person`, `softwareSystem`, `container`): define qué es y en qué nivel vive.
- **Tags**: clasificaciones semánticas libres sobre elementos y relaciones.
- **Styles por tag**: cada estilo se aplica a los elementos con un tag (o al tag base `Element`):
  forma, fondo, color.
- **Vistas por nivel**: cada vista dice qué incluir (`include *`, o elementos concretos) y cómo
  distribuir (`autolayout lr`).
- **Relaciones implícitas**: si un usuario usa un contenedor de un sistema, en la vista de contexto
  aparece una relación del usuario con el sistema entero. La relación de nivel fino implica la de
  nivel grueso, y se puede desactivar con `!impliedRelationships false`.

## Cómo resuelve la edición de vuelta

El texto del DSL es la fuente de verdad; se edita como código. Structurizr sí tiene un editor de
diagramas en el navegador, pero solo para el **layout manual**: *"Structurizr takes control of
rendering the boxes and arrows for you with a variety of notation available. All you need to do, if
you want to, is move them around the diagram canvas."* Mover cajas no cambia el modelo.

## Fragmento de código real

Documentación de Structurizr, *DSL — Example*:

```text
workspace {

    model {
        u = person "User"
        ss = softwareSystem "Software System"

        u -> ss "Uses"
    }

    views {
        systemContext ss {
            include *
        }
    }
    
}
```

*Cookbook — Element styles*, estilo aplicado por tag:

```text
workspace {

    model {
        a = softwareSystem "A" {
            tags "Tag 1"
        }
        b = softwareSystem "B"
        c = softwareSystem "C"

        a -> b
        b -> c
    }

    views {
        systemLandscape {
            include *
            autolayout lr
        }
        
        styles {
            element "Tag 1" {
                background #1168bd
                color #ffffff
                shape RoundedBox
            }
        }
    }
    
}
```

*Cookbook — Implied relationships*: la relación declarada es `u -> webapp` (con un contenedor),
pero la vista de contexto del sistema `s` la muestra como `u -> s`:

```text
workspace {

    model {
        u = person "User"
        s = softwareSystem "Software System" {
            webapp = container "Web Application"
        }

        u -> webapp "Uses"
    }

    views {
        systemContext s {
            include *
            autoLayout lr
        }
    }
    
}
```

## Qué tomamos y qué no

**Tomamos**

- **Modelo y vistas separados**, varias vistas consistentes sobre un solo modelo: un mundo `pron`
  con varios vocabulario visual.
- **Tags semánticos → estilos**: el estilo cuelga de una clasificación del dato, no del elemento
  suelto. En `pron`, la clasificación ya existe (`__family__`, `__semantics__`, el modelo, el
  `relation_type`).
- **Relaciones implícitas entre niveles**: si una vista agrupa elementos (anidamiento o zoom), las
  aristas de sus partes pueden subir al grupo. Resuelve un problema real de las vistas con foco de
  `graph_ui`.
- **El layout manual no cambia el modelo**: distinción útil entre gestos que escriben el mundo y
  gestos que solo acomodan la vista.

**No tomamos**

- El vocabulario fijo (C4 es un vocabulario, no un framework para declarar vocabularios).
- La edición solo como texto: queremos editar a través del diagrama.

## Fuentes

- Structurizr, *Why "as code"?*: https://docs.structurizr.com/as-code
- Structurizr DSL, *Example*: https://docs.structurizr.com/dsl/example
- Structurizr DSL cookbook, *Element styles*: https://docs.structurizr.com/dsl/cookbook/element-styles
- Structurizr DSL cookbook, *Implied relationships*: https://docs.structurizr.com/dsl/cookbook/implied-relationships
- S. Brown, *The C4 model*: https://c4model.com/
