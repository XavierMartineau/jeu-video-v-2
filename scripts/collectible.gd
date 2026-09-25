@tool
extends Area2D

var taken := false
var bob_time := 0.0

func _ready() -> void:
    body_entered.connect(_on_body_entered)
    queue_redraw()

func _process(delta: float) -> void:
    bob_time += delta
    position.y += sin(bob_time * 3.0) * 0.18
    rotation += delta * 1.5

func _on_body_entered(body: Node) -> void:
    if taken or not body.has_method("take_damage"):
        return
    taken = true
    var game = get_tree().current_scene
    if game.has_method("collect_coin"):
        game.collect_coin()
    queue_free()

func _draw() -> void:
    draw_circle(Vector2.ZERO, 11.0, Color("#f4c95d"))
    draw_circle(Vector2.ZERO, 7.0, Color("#ffe8a3"))
    draw_line(Vector2(-3, -6), Vector2(3, 6), Color("#c58b2c"), 2.0)
