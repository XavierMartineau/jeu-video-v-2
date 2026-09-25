extends Area2D

var direction := 1.0
var speed := 620.0
var lifetime := 1.4

func _ready() -> void:
    body_entered.connect(_on_body_entered)
    queue_redraw()

func _physics_process(delta: float) -> void:
    position.x += direction * speed * delta
    lifetime -= delta
    if lifetime <= 0.0:
        queue_free()
    queue_redraw()

func _on_body_entered(body: Node) -> void:
    if body.has_method("hit"):
        body.hit()
        queue_free()

func _draw() -> void:
    draw_circle(Vector2.ZERO, 9.0, Color("#b8f2e6"))
    draw_circle(Vector2.ZERO, 5.0, Color("#ffffff"))
    draw_line(Vector2(-direction * 18.0, 0), Vector2(-direction * 7.0, 0), Color("#4aa3a2"), 4.0)
