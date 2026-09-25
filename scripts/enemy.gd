extends CharacterBody2D

@export var boss := false
var direction := -1.0
var health := 3
var max_health := 3
var start_x := 0.0

func _ready() -> void:
    start_x = global_position.x
    if boss:
        max_health = 8
        health = max_health
    queue_redraw()

func _physics_process(delta: float) -> void:
    velocity += get_gravity() * delta
    velocity.x = direction * (55.0 if not boss else 38.0)
    move_and_slide()
    if abs(global_position.x - start_x) > (130.0 if not boss else 210.0):
        direction *= -1.0
    for index in get_slide_collision_count():
        var collision := get_slide_collision(index)
        if collision.get_collider().has_method("take_damage"):
            collision.get_collider().take_damage(25)
    queue_redraw()

func hit() -> void:
    health -= 1
    if health <= 0:
        queue_free()

func _draw() -> void:
    var size := 34.0 if boss else 23.0
    var color := Color("#7d5260") if boss else Color("#314e52")
    draw_circle(Vector2(0, -size * 0.35), size, color)
    draw_rect(Rect2(-size, 0, size * 2.0, size), color, true)
    draw_circle(Vector2(-size * 0.35, -size * 0.45), 4.0, Color("#f4c95d"))
    draw_circle(Vector2(size * 0.35, -size * 0.45), 4.0, Color("#f4c95d"))
    var bar_width := 84.0 if boss else 52.0
    var bar_y := -58.0 if boss else -38.0
    draw_rect(Rect2(-bar_width / 2.0, bar_y, bar_width, 7), Color("#202b38"), true)
    draw_rect(Rect2(-bar_width / 2.0, bar_y, bar_width * health / float(max_health), 7), Color("#e86f51"), true)
